import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const geminiApiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (geminiApiKey) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
}

// Clause / Section Chunker
export const processAndChunkDocument = async (documentId, fullText) => {
  // Delete existing chunks
  await prisma.documentChunk.deleteMany({ where: { documentId } });

  // Clean and split text into structural paragraphs/clauses
  const rawSections = fullText
    .split(/\n\s*\n|(?=^#{1,4}\s)|(?=^\d+\.\s+[A-Z])|(?=^[A-Z\s]{4,}:)/m)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const chunksToInsert = rawSections.map((sectionText, index) => {
    // Attempt section title extraction
    let sectionTitle = `Section ${index + 1}`;
    const titleMatch = sectionText.match(/^(?:#+\s*)?([^\n\r]+)/);
    if (titleMatch && titleMatch[1]) {
      sectionTitle = titleMatch[1].replace(/[*#]/g, '').trim().slice(0, 60);
    }

    // Estimate page number (assuming ~2500 chars per page)
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

  // Update status to READY
  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'READY' }
  });

  return chunksToInsert.length;
};

// TF-IDF / Term matching similarity calculation
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

// Grounded Document Q&A RAG
export const queryDocumentRAG = async (userId, documentId, userQuestion) => {
  // Authorization check
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

  // Rank chunks by relevance
  const scoredChunks = document.chunks.map(chunk => ({
    ...chunk,
    score: computeRelevanceScore(userQuestion, chunk.content)
  })).sort((a, b) => b.score - a.score);

  const topChunk = scoredChunks[0];

  // Insufficient evidence guardrail
  if (!topChunk || topChunk.score < 1) {
    return {
      answer: "I couldn't find enough information in the selected document to answer that reliably.",
      explanation: "The query topic does not appear to be explicitly mentioned in the clauses of this contract.",
      relevantClause: "No matching clause found.",
      sourceCitation: `${document.title}`
    };
  }

  // If Gemini API is available, generate grounded LLM answer
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

  // Deterministic local grounded response
  return {
    answer: `Based on ${topChunk.section || 'the contract clauses'}, here is the relevant term: "${topChunk.content.slice(0, 180)}..."`,
    explanation: `This clause specifies the obligations and rules regarding "${userQuestion}".`,
    relevantClause: topChunk.content.slice(0, 250),
    sourceCitation: `${document.title} — ${topChunk.section || 'Clause'} (Page ${topChunk.pageNumber || 1})`
  };
};

const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';

// General Legal Educational QA - Delegated to Python AI Backend (LangGraph)
export const queryGeneralLegalAI = async (messages, vaultId = null) => {
  try {
    const response = await fetch(`${aiBackendUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, vault_id: vaultId })
    });

    if (!response.ok) {
      throw new Error(`Python AI Backend Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Assuming the Python backend returns:
    // { is_complete, missing_information, analysis, counterarguments, retrieved_statutes, retrieved_precedents, flagged_citations }
    const { is_complete, missing_information, analysis, counterarguments, retrieved_statutes, retrieved_precedents, flagged_citations } = data;

    if (!is_complete) {
      return {
        answer: missing_information,
        explanation: "Junior Lawyer needs more facts before the Senior Advocate can analyze the case.",
        relevantClause: "N/A",
        sourceCitation: "Lexora AI Intake"
      };
    }

    // Build the final response format mimicking the RAG response
    const combinedAnswer = `${analysis}\n\n**Adversarial Perspective (Risks & Counterarguments):**\n${counterarguments}`;
    
    // Combine citations for the frontend
    const citations = [
      ...(retrieved_statutes || []),
      ...(retrieved_precedents || []),
      ...(flagged_citations || [])
    ];
    
    return {
      answer: combinedAnswer,
      explanation: "Comprehensive legal analysis generated by Senior Advocate and stress-tested by Adversarial Counsel.",
      relevantClause: "N/A",
      sourceCitation: JSON.stringify(citations),
      flaggedCitations: flagged_citations || []
    };
  } catch (e) {
    console.error('Failed to communicate with Python AI Backend:', e.message);
    return {
      answer: "I am currently unable to reach the Lexora AI Core Engine. Please ensure the Python backend is running on port 8000.",
      explanation: "System Error.",
      relevantClause: "N/A",
      sourceCitation: "System Error",
      is_complete: false
    };
  }
};

// Clause Explainer
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

// Timeline Generator - Calls Python Timeline API
export const generateTimeline = async (text) => {
  try {
    const response = await fetch(`${aiBackendUrl}/api/v1/research/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Python AI Backend Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.timeline;
  } catch (e) {
    console.error('Failed to generate timeline via Python AI Backend:', e.message);
    throw e;
  }
};

// Drafting Agent - Calls Python Draft API
export const draftDocument = async (prompt) => {
  try {
    const response = await fetch(`${aiBackendUrl}/api/v1/research/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, jurisdiction: "India" })
    });

    if (!response.ok) {
      throw new Error(`Python AI Backend Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Failed to generate draft via Python AI Backend:', e.message);
    throw e;
  }
};
