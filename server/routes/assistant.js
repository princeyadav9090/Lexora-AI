import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { queryDocumentRAG, queryGeneralLegalAI, explainClause } from '../services/ragService.js';

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

    // Execute Grounded RAG or General Legal AI depending on context mode
    let aiResponse;
    if (conversation.contextMode === 'DOCUMENT' && conversation.documentId) {
      aiResponse = await queryDocumentRAG(req.user.id, conversation.documentId, content);
    } else {
      aiResponse = await queryGeneralLegalAI(content);
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
