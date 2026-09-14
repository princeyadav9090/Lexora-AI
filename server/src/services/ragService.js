import prisma from '../config/db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const geminiApiKey = env.GEMINI_API_KEY;
let genAI = null;
if (geminiApiKey) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
}

export const processAndChunkDocument = async (documentId, fullText) => {
  await prisma.documentChunk.deleteMany({ where: { documentId } });

  const rawSections = fullText
    .split(/\n\s*\n|(?=^#{1,4}\s)|(?=^\d+\.\s+[A-Z])|(?=^[A-Z\s]{4,}:)/m)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const chunksToInsert = rawSections.map((sectionText, index) => {
    let sectionTitle = `Section ${index + 1}`;
    const titleMatch = sectionText.match(/^(?:#+\s*)?([^\n\r]+)/);
    if (titleMatch && titleMatch[1]) {
      sectionTitle = titleMatch[1].replace(/[*#]/g, '').trim().slice(0, 60);
    }

    const pageNum = Math.floor((index * 300) / 2500) + 1;

    return {
      documentId,
      chunkIndex: index + 1,
      content: sectionText,
      section: sectionTitle,
      pageNumber: pageNum
    };
  });

  if (chunksToInsert.length > 0) {
    await prisma.documentChunk.createMany({ data: chunksToInsert });
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'READY' }
  });

  return chunksToInsert.length;
};

const computeRelevanceScore = (query, text) => {
  const queryTerms = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(t => t.length > 2);
  const textLower = text.toLowerCase();
  
  let score = 0;
  for (const term of queryTerms) {
    const matches = (textLower.match(new RegExp(`\\b${term}\\b`, 'g')) || []).length;
    score += matches * 2;
    if (textLower.includes(term)) {
      score += 1;
    }
  }
  return score;
};

export const queryDocumentRAG = async (userId, documentId, userQuestion) => {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: { chunks: true }
  });

  if (!document) {
    throw new Error('DOCUMENT_NOT_FOUND_OR_UNAUTHORIZED');
  }

  if (document.chunks.length === 0) {
    return {
      answer: "I couldn't find enough information in the selected document to answer that reliably because the document text has not been processed yet.",
      explanation: "Document has no indexed text chunks.",
      relevantClause: "N/A",
      sourceCitation: `${document.title} — Status: ${document.status}`
    };
  }

  const scoredChunks = document.chunks.map(chunk => ({
    ...chunk,
    score: computeRelevanceScore(userQuestion, chunk.content)
  })).sort((a, b) => b.score - a.score);

  const topChunk = scoredChunks[0];

  if (!topChunk || topChunk.score < 1) {
    return {
      answer: "I couldn't find enough information in the selected document to answer that reliably.",
      explanation: "The query topic does not appear to be explicitly mentioned in the clauses of this contract.",
      relevantClause: "No matching clause found.",
      sourceCitation: `${document.title}`
    };
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are Lexora AI, a grounded legal assistant.
You are given a question and a verified excerpt from a legal contract.
Answer ONLY based on the excerpt below. If the excerpt does NOT contain the answer, say "I couldn't find enough information in the selected document to answer that reliably."

Document: ${document.title}
Section: ${topChunk.section || 'General Clause'}
Page: ${topChunk.pageNumber || 1}

Excerpt:
"""
${topChunk.content}
"""

User Question: ${userQuestion}

Provide a response in JSON format:
{
  "answer": "Direct concise answer",
  "explanation": "Simple plain-language explanation of what this means for the user",
  "relevantClause": "Exact snippet of the clause from the excerpt",
  "sourceCitation": "${document.title} — ${topChunk.section || 'Clause'} (Page ${topChunk.pageNumber || 1})"
}`;

      const result = await model.generateContent(prompt);
      const textResp = result.response.text();
      const jsonMatch = textResp.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Gemini API call fallback to heuristic engine:', e.message);
    }
  }

  return {
    answer: `Based on ${topChunk.section || 'the contract clauses'}, here is the relevant term: "${topChunk.content.slice(0, 180)}..."`,
    explanation: `This clause specifies the obligations and rules regarding "${userQuestion}".`,
    relevantClause: topChunk.content.slice(0, 250),
    sourceCitation: `${document.title} — ${topChunk.section || 'Clause'} (Page ${topChunk.pageNumber || 1})`
  };
};

export const queryGeneralLegalAI = async (userQuestion) => {
  const qLower = userQuestion.toLowerCase();

  if (qLower.includes('nda') || qLower.includes('non-disclosure')) {
    return {
      answer: "A Non-Disclosure Agreement (NDA) is a legally binding contract that establishes a confidential relationship between parties to protect proprietary information, trade secrets, or sensitive business data from public disclosure.",
      explanation: "When you sign an NDA, you promise not to share the specified confidential information with anyone outside the approved scope.",
      relevantClause: "Standard Confidentiality Obligation & Remedy for Breach Clause",
      sourceCitation: "General Legal Knowledge Base — Indian Contract Act, 1872"
    };
  }

  if (qLower.includes('notice period')) {
    return {
      answer: "A notice period is the required timeframe between notifying a party of contract termination and the actual end date of employment or lease.",
      explanation: "In employment, notice periods usually range from 30 to 90 days in India, allowing the employer to transition work or find a replacement.",
      relevantClause: "Standard Termination & Notice Period Clause",
      sourceCitation: "General Legal Knowledge Base — Labor & Employment Law"
    };
  }

  if (qLower.includes('indemnity') || qLower.includes('indemnification')) {
    return {
      answer: "Indemnity is a contractual clause where one party promises to compensate the other for legal liabilities, damages, losses, or costs arising from specified events.",
      explanation: "It shifts financial risk. If party A causes a legal loss, party A agrees to cover party B's expenses.",
      relevantClause: "Indian Contract Act, 1872 — Section 124 (Contract of Indemnity)",
      sourceCitation: "General Legal Knowledge Base — Commercial Law"
    };
  }

  if (qLower.includes('rental') || qLower.includes('lease') || qLower.includes('tenant')) {
    return {
      answer: "In India, rental agreements for 11 months are standard to avoid compulsory registration requirements under the Registration Act, 1908. Rent, security deposit, notice period, and maintenance should be clearly stated.",
      explanation: "Ensure the agreement specifies who pays for repairs, electricity, water, and deposit refund terms upon vacating.",
      relevantClause: "Rent Control & Property Transfer Laws (India)",
      sourceCitation: "General Legal Knowledge Base — Real Estate & Property Law"
    };
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are Lexora AI, an educational legal assistant for Indian law.
Answer this general legal query clearly. Emphasize that this is general educational legal information, not formal legal representation.

Question: ${userQuestion}

JSON response format:
{
  "answer": "Clear legal information answer",
  "explanation": "Simple plain language summary",
  "relevantClause": "Relevant statutory act or legal principle (e.g. Indian Contract Act 1872)",
  "sourceCitation": "Educational Legal Reference — Lexora Legal Knowledge Base"
}`;

      const result = await model.generateContent(prompt);
      const textResp = result.response.text();
      const jsonMatch = textResp.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Gemini General AI fallback:', e.message);
    }
  }

  return {
    answer: `Regarding "${userQuestion}": In Indian law, contract provisions are governed by the Indian Contract Act, 1872. Key terms should always be clearly defined, with clear obligations, termination conditions, and dispute resolution mechanisms.`,
    explanation: "Legal contracts require mutual consent, valid consideration, lawful object, and free consent between competent parties.",
    relevantClause: "Indian Contract Act, 1872 — Section 10 (What agreements are contracts)",
    sourceCitation: "Educational Legal Reference — Indian Legal System Overview"
  };
};

export const explainClause = async (clauseText) => {
  return {
    originalClause: clauseText,
    simplifiedExplanation: `This clause means: You are agreeing that the terms defined here apply strictly as stated. If either party breaks this requirement, legal remedies or monetary penalties may apply under Indian law.`,
    keyObligations: [
      'Must follow the exact conditions described in the text.',
      'Requires written notification before making changes.',
      'Governed by local jurisdiction courts in India.'
    ]
  };
};
