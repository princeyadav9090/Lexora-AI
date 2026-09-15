import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { queryDocumentRAG, queryGeneralLegalAI, explainClause, generateTimeline } from '../services/ragService.js';

const router = express.Router();
const prisma = new PrismaClient();

// List user conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      document: { select: { id: true, title: true, type: true } },
      messages: { orderBy: { createdAt: 'asc' } }
    }
  });

  return res.json({ conversations });
});

// Create new conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  const { title, documentId, contextMode = 'GENERAL' } = req.body;

  let validatedDocId = null;
  if (documentId) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId: req.user.id }
    });
    if (doc) {
      validatedDocId = doc.id;
    }
  }

  const mode = validatedDocId ? 'DOCUMENT' : 'GENERAL';
  const convTitle = title || (validatedDocId ? `Document Q&A` : `General Legal Consultation`);

  const conversation = await prisma.conversation.create({
    data: {
      userId: req.user.id,
      documentId: validatedDocId,
      title: convTitle,
      contextMode: mode
    },
    include: {
      document: { select: { id: true, title: true } }
    }
  });

  return res.status(201).json({ conversation });
});

// Send message in conversation
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: { code: 'EMPTY_MESSAGE', message: 'Message content cannot be empty.' }
      });
    }

    // Verify conversation ownership
    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!conversation) {
      return res.status(404).json({
        error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found.' }
      });
    }

    // Save User message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'USER',
        content
      }
    });

    // Execute Grounded RAG, General Legal AI, Timeline Extractor, or Drafting Agent
    let aiResponse;
    const isTimelineRequest = content.trim().startsWith('/timeline');
    const isDraftRequest = content.trim().startsWith('/draft');

    if (isTimelineRequest) {
      const textToExtract = content.replace('/timeline', '').trim();
      
      // If user just typed /timeline without text, we can use the conversation history
      let extractionSource = textToExtract;
      if (!extractionSource) {
        const history = await prisma.message.findMany({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: 'asc' }
        });
        extractionSource = history.map(m => m.content).join('\n');
      }

      try {
        const timelineData = await generateTimeline(extractionSource);
        aiResponse = {
          answer: `{"timeline": ${JSON.stringify(timelineData)}}`,
          explanation: "Automated Timeline Extractor",
          relevantClause: "N/A",
          sourceCitation: "Lexora AI Timeline Tool"
        };
      } catch (err) {
        aiResponse = {
          answer: "Failed to generate timeline. Please try again.",
          explanation: "Error connecting to AI Engine.",
          relevantClause: "N/A",
          sourceCitation: "System Error"
        };
      }
    } else if (isDraftRequest) {
      const promptToDraft = content.replace('/draft', '').trim();
      if (!promptToDraft) {
        return res.status(400).json({
          error: { code: 'EMPTY_DRAFT_PROMPT', message: 'Please provide instructions for the draft.' }
        });
      }

      try {
        const draftData = await draftDocument(promptToDraft);
        aiResponse = {
          answer: `{"is_draft": true, "draft": ${JSON.stringify(draftData.draft)}, "template_used": "${draftData.template_used}"}`,
          explanation: "Lexora AI Drafting Agent",
          relevantClause: "N/A",
          sourceCitation: `Grounded on: ${draftData.template_used}`
        };
      } catch (err) {
        aiResponse = {
          answer: "Failed to generate document draft. Please try again.",
          explanation: "Error connecting to AI Engine.",
          relevantClause: "N/A",
          sourceCitation: "System Error"
        };
      }
    } else if (conversation.contextMode === 'DOCUMENT' && conversation.documentId) {
      aiResponse = await queryDocumentRAG(req.user.id, conversation.documentId, content);
    } else {
      // Fetch full history to send to LangGraph backend
      const history = await prisma.message.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'asc' }
      });
      
      const messagesPayload = history.map(m => ({
        role: m.sender === 'USER' ? 'user' : 'assistant',
        content: m.content
      }));
      // ensure the latest message is in the payload
      
      aiResponse = await queryGeneralLegalAI(messagesPayload, conversation.vaultId);
    }

    // Save AI response message
    const aiMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'AI',
        content: aiResponse.answer,
        explanation: aiResponse.explanation,
        relevantClause: aiResponse.relevantClause,
        sourceCitation: aiResponse.sourceCitation
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    return res.json({ message: aiMessage, responseDetails: aiResponse });
  } catch (error) {
    console.error('AI Assistant Message Error:', error);
    return res.status(500).json({
      error: { code: 'AI_PROCESSING_ERROR', message: 'Failed to process AI legal response.' }
    });
  }
});

// Clause Explainer API
router.post('/explain-clause', authenticateToken, async (req, res) => {
  const { clauseText } = req.body;
  if (!clauseText) {
    return res.status(400).json({ error: { message: 'Clause text is required.' } });
  }
  const explanation = await explainClause(clauseText);
  return res.json(explanation);
});

export default router;
