import prisma from '../config/db.js';
import { queryDocumentRAG, queryGeneralLegalAI, explainClause as explainClauseEngine } from './ragService.js';
import { ApiError } from '../utils/ApiError.js';

export const assistantService = {
  async getConversations(userId) {
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        document: {
          select: { id: true, title: true, type: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  },

  async createConversation(userId, { title, documentId, contextMode = 'GENERAL' }) {
    if (!title) {
      throw new ApiError(400, 'Conversation title is required.');
    }

    if (documentId) {
      const doc = await prisma.document.findFirst({
        where: { id: documentId, userId }
      });
      if (!doc) {
        throw new ApiError(404, 'Associated document not found.');
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        documentId: documentId || null,
        title,
        contextMode: documentId ? 'DOCUMENT' : contextMode
      },
      include: {
        document: {
          select: { id: true, title: true, type: true }
        },
        messages: true
      }
    });

    return conversation;
  },

  async sendMessage(userId, conversationId, content) {
    if (!content) {
      throw new ApiError(400, 'Message content is required.');
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId }
    });

    if (!conversation) {
      throw new ApiError(404, 'Conversation not found.');
    }

    await prisma.message.create({
      data: {
        conversationId,
        sender: 'USER',
        content
      }
    });

    let aiResult;
    if (conversation.contextMode === 'DOCUMENT' && conversation.documentId) {
      aiResult = await queryDocumentRAG(userId, conversation.documentId, content);
    } else {
      // Fetch full history to send to LangGraph backend
      const history = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' }
      });
      
      const messagesPayload = history.map(m => ({
        role: m.sender === 'USER' ? 'user' : 'assistant',
        content: m.content
      }));
      
      aiResult = await queryGeneralLegalAI(messagesPayload, conversation.vaultId);
    }

    const aiMessage = await prisma.message.create({
      data: {
        conversationId,
        sender: 'AI',
        content: aiResult.answer,
        explanation: aiResult.explanation,
        relevantClause: aiResult.relevantClause,
        sourceCitation: aiResult.sourceCitation
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return aiMessage;
  },

  async explainClause({ clauseText }) {
    if (!clauseText) {
      throw new ApiError(400, 'Clause text is required.');
    }
    return explainClauseEngine(clauseText);
  },

  async deleteConversation(userId, conversationId) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId }
    });

    if (!conversation) {
      throw new ApiError(404, 'Conversation not found.');
    }

    await prisma.conversation.delete({
      where: { id: conversationId }
    });

    return true;
  }
};
