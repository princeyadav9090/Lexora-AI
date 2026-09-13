import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { DOCUMENT_TEMPLATES, generateLegalDocument } from '../services/documentGenerator.js';
import { processAndChunkDocument } from '../services/ragService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get list of document templates
router.get('/templates', authenticateToken, async (req, res) => {
  return res.json({ templates: Object.values(DOCUMENT_TEMPLATES) });
});

// Dynamic User Dashboard Metrics Endpoint
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalDocs, readyDocs, signedDocs, draftDocs, docsList] = await Promise.all([
      prisma.document.count({ where: { userId } }),
      prisma.document.count({ where: { userId, status: 'READY' } }),
      prisma.document.count({ where: { userId, status: 'SIGNED' } }),
      prisma.document.count({ where: { userId, status: 'DRAFT' } }),
      prisma.document.findMany({ where: { userId }, select: { fileSize: true, versions: { select: { content: true } } } })
    ]);

    // Calculate actual storage size dynamically
    let totalBytes = 0;
    for (const doc of docsList) {
      if (doc.fileSize) {
        totalBytes += doc.fileSize;
      } else if (doc.versions && doc.versions.length > 0) {
        totalBytes += (doc.versions[0].content || '').length;
      }
    }

    const storageMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const storageGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);

    return res.json({
      stats: {
        totalDocuments: totalDocs,
        activeContracts: readyDocs + signedDocs,
        signedContracts: signedDocs,
        pendingDrafts: draftDocs,
        storageBytes: totalBytes,
        storageMB: `${storageMB} MB`,
        storageDisplay: totalBytes > 1024 * 1024 * 1024 ? `${storageGB} GB` : `${storageMB} MB`
      }
    });
  } catch (error) {
    console.error('Stats Calculation Error:', error);
    return res.status(500).json({ error: { message: 'Failed to calculate dynamic stats.' } });
  }
});

// Generate legal document from questionnaire answers
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { documentType, title, answers } = req.body;

    if (!documentType || !answers || !DOCUMENT_TEMPLATES[documentType]) {
      return res.status(400).json({
        error: { code: 'INVALID_TEMPLATE', message: 'Valid document type and answers are required.' }
      });
    }

    const templateConfig = DOCUMENT_TEMPLATES[documentType];
    const generatedContent = generateLegalDocument(documentType, answers);
    const docTitle = title || `${templateConfig.name} - ${answers.disclosingParty || answers.tenantName || answers.employeeName || answers.clientName || 'Draft'}`;

    // Create Document record dynamically
    const document = await prisma.document.create({
      data: {
        userId: req.user.id,
        title: docTitle,
        type: documentType,
        jurisdiction: answers.governingState || 'IN',
        status: 'READY',
        fileType: 'TXT',
        fileSize: Buffer.byteLength(generatedContent, 'utf-8'),
        currentVersion: 1
      }
    });

    // Create Initial Version v1
    const initialVersion = await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        content: generatedContent,
        structuredData: JSON.stringify(answers),
        createdById: req.user.id,
        changeLog: 'AI Initial Guided Generation'
      }
    });

    // Chunk and index content for RAG Q&A dynamically
    await processAndChunkDocument(document.id, generatedContent);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DOCUMENT_GENERATED',
        details: `Generated ${documentType}: ${document.id}`
      }
    });

    return res.status(201).json({
      message: 'Document generated successfully',
      document: {
        ...document,
        content: generatedContent,
        versions: [initialVersion]
      }
    });
  } catch (error) {
    console.error('Document Generation Error:', error);
    return res.status(500).json({
      error: { code: 'GENERATION_FAILED', message: 'Failed to generate document draft.' }
    });
  }
});

// Get user documents list
router.get('/', authenticateToken, async (req, res) => {
  const documents = await prisma.document.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 1
      }
    }
  });

  return res.json({ documents });
});

// Get single document detail (Strict IDOR authorization check)
router.get('/:id', authenticateToken, async (req, res) => {
  const document = await prisma.document.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      versions: { orderBy: { version: 'desc' } },
      chunks: { orderBy: { chunkIndex: 'asc' } }
    }
  });

  if (!document) {
    return res.status(404).json({
      error: { code: 'DOCUMENT_NOT_FOUND', message: 'The requested document could not be found or accessed.' }
    });
  }

  return res.json({ document });
});

// Update / Edit document (Creates new version v2, v3...)
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { content, title, changeLog = 'User Manual Edit' } = req.body;

    const existingDoc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
    });

    if (!existingDoc) {
      return res.status(404).json({
        error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found or unauthorized.' }
      });
    }

    if (existingDoc.status === 'SIGNED') {
      return res.status(400).json({
        error: { code: 'DOCUMENT_LOCKED', message: 'Signed documents are locked and read-only. Create a copy to edit.' }
      });
    }

    const nextVersionNum = existingDoc.currentVersion + 1;
    const newContent = content || (existingDoc.versions[0]?.content || '');

    // Create new Version
    const newVersion = await prisma.documentVersion.create({
      data: {
        documentId: existingDoc.id,
        version: nextVersionNum,
        content: newContent,
        createdById: req.user.id,
        changeLog
      }
    });

    // Update document record
    const updatedDoc = await prisma.document.update({
      where: { id: existingDoc.id },
      data: {
        title: title || existingDoc.title,
        currentVersion: nextVersionNum,
        fileSize: Buffer.byteLength(newContent, 'utf-8'),
        updatedAt: new Date()
      }
    });

    // Re-index updated text for RAG dynamically
    if (content) {
      await processAndChunkDocument(existingDoc.id, content);
    }

    return res.json({
      message: 'Document updated successfully',
      document: updatedDoc,
      version: newVersion
    });
  } catch (error) {
    console.error('Update Document Error:', error);
    return res.status(500).json({
      error: { code: 'UPDATE_FAILED', message: 'Failed to update document.' }
    });
  }
});

// Sign / Finalize Document (Demo Digital Signature Flow)
router.post('/:id/sign', authenticateToken, async (req, res) => {
  const existingDoc = await prisma.document.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!existingDoc) {
    return res.status(404).json({
      error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found.' }
    });
  }

  const updatedDoc = await prisma.document.update({
    where: { id: existingDoc.id },
    data: { status: 'SIGNED' }
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'DOCUMENT_SIGNED',
      details: `Signed document ${existingDoc.id} via Development Signature Provider`
    }
  });

  return res.json({
    message: 'Document signed and locked successfully.',
    document: updatedDoc,
    signatureProvider: 'Development Signature Provider'
  });
});

// Delete Document
router.delete('/:id', authenticateToken, async (req, res) => {
  const existingDoc = await prisma.document.findFirst({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!existingDoc) {
    return res.status(404).json({
      error: { code: 'DOCUMENT_NOT_FOUND', message: 'Document not found or unauthorized.' }
    });
  }

  await prisma.document.delete({ where: { id: existingDoc.id } });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'DOCUMENT_DELETED',
      details: `Deleted document ${req.params.id}`
    }
  });

  return res.json({ message: 'Document deleted successfully.' });
});

export default router;
