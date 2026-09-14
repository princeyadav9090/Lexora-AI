import prisma from '../config/db.js';
import { generateLegalDocument, DOCUMENT_TEMPLATES } from './documentGenerator.js';
import { processAndChunkDocument } from './ragService.js';
import { ApiError } from '../utils/ApiError.js';

export const documentService = {
  async getTemplates() {
    return DOCUMENT_TEMPLATES;
  },

  async getDashboardStats(userId) {
    const totalDocuments = await prisma.document.count({ where: { userId } });
    const readyDocuments = await prisma.document.count({ where: { userId, status: 'READY' } });
    const draftDocuments = await prisma.document.count({ where: { userId, status: 'DRAFT' } });
    const totalConversations = await prisma.conversation.count({ where: { userId } });

    const recentDocs = await prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, type: true, status: true, updatedAt: true }
    });

    return {
      totalDocuments,
      readyDocuments,
      draftDocuments,
      totalConversations,
      recentDocs
    };
  },

  async generateDocument(userId, { documentType, title, answers }) {
    if (!documentType || !title || !answers) {
      throw new ApiError(400, 'Document type, title, and form answers are required.');
    }

    const generatedContent = generateLegalDocument(documentType, answers);

    const newDoc = await prisma.document.create({
      data: {
        userId,
        title,
        type: documentType,
        jurisdiction: 'IN',
        status: 'PROCESSING',
        fileType: 'TXT',
        currentVersion: 1
      }
    });

    await prisma.documentVersion.create({
      data: {
        documentId: newDoc.id,
        version: 1,
        content: generatedContent,
        structuredData: JSON.stringify(answers),
        createdById: userId,
        changeLog: 'AI Initial Guided Generation'
      }
    });

    await processAndChunkDocument(newDoc.id, generatedContent);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DOCUMENT_GENERATED',
        details: `Generated ${documentType} document titled "${title}"`
      }
    });

    return {
      id: newDoc.id,
      title: newDoc.title,
      type: newDoc.type,
      status: 'READY',
      content: generatedContent,
      version: 1
    };
  },

  async getUserDocuments(userId) {
    return prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });
  },

  async getDocumentDetail(userId, documentId) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId },
      include: {
        versions: {
          orderBy: { version: 'desc' }
        },
        chunks: {
          orderBy: { chunkIndex: 'asc' }
        }
      }
    });

    if (!doc) {
      throw new ApiError(404, 'Document not found or access denied.');
    }

    return doc;
  },

  async updateDocument(userId, documentId, { content, title, changeLog }) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
    });

    if (!doc) {
      throw new ApiError(404, 'Document not found or access denied.');
    }

    const nextVersion = doc.currentVersion + 1;

    await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        version: nextVersion,
        content: content || doc.versions[0]?.content || '',
        createdById: userId,
        changeLog: changeLog || `Updated to version ${nextVersion}`
      }
    });

    const updatedDoc = await prisma.document.update({
      where: { id: documentId },
      data: {
        title: title || doc.title,
        currentVersion: nextVersion,
        updatedAt: new Date()
      }
    });

    if (content) {
      await processAndChunkDocument(documentId, content);
    }

    return updatedDoc;
  },

  async signDocument(userId, documentId) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId }
    });

    if (!doc) {
      throw new ApiError(404, 'Document not found.');
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { status: 'SIGNED' }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DOCUMENT_SIGNED',
        details: `Digital signature applied to document ${documentId}`
      }
    });

    return updated;
  },

  async deleteDocument(userId, documentId) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId }
    });

    if (!doc) {
      throw new ApiError(404, 'Document not found.');
    }

    await prisma.document.delete({ where: { id: documentId } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DOCUMENT_DELETED',
        details: `Deleted document ${documentId}`
      }
    });

    return { id: documentId };
  }
};
