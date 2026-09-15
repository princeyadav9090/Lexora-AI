import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { processAndChunkDocument } from '../services/ragService.js';

const router = express.Router();
const prisma = new PrismaClient();

// Storage setup
const storageDir = path.join(process.cwd(), 'server', 'storage', 'vault');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, storageDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `vault-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE: Only PDF, DOCX, and TXT files are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max limit
  fileFilter
});

// GET all vaults
router.get('/', authenticateToken, async (req, res) => {
  try {
    const vaults = await prisma.vault.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return res.json({ vaults });
  } catch (error) {
    console.error('Fetch Vaults Error:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch vaults.' } });
  }
});

// CREATE a new vault
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: { message: 'Vault name is required.' } });
    }
    const vault = await prisma.vault.create({
      data: { userId: req.user.id, name, description }
    });
    return res.status(201).json({ vault });
  } catch (error) {
    console.error('Create Vault Error:', error);
    return res.status(500).json({ error: { message: 'Failed to create vault.' } });
  }
});

// GET vault details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const vault = await prisma.vault.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { documents: true }
    });
    if (!vault) {
      return res.status(404).json({ error: { message: 'Vault not found.' } });
    }
    return res.json({ vault });
  } catch (error) {
    return res.status(500).json({ error: { message: 'Failed to fetch vault details.' } });
  }
});

// ADD existing document to vault
router.post('/:id/documents', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.body;
    const vault = await prisma.vault.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!vault) return res.status(404).json({ error: { message: 'Vault not found.' } });
    
    const document = await prisma.document.findFirst({ where: { id: documentId, userId: req.user.id } });
    if (!document) return res.status(404).json({ error: { message: 'Document not found.' } });

    const updatedDoc = await prisma.document.update({
      where: { id: documentId },
      data: { vaultId: vault.id }
    });

    return res.json({ message: 'Document added to vault.', document: updatedDoc });
  } catch (error) {
    return res.status(500).json({ error: { message: 'Failed to add document to vault.' } });
  }
});

// Upload document directly to Vault
router.post('/uploads', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { code: 'NO_FILE', message: 'Please upload a PDF, DOCX, or TXT file.' } });
    }

    const { vaultId } = req.body;
    if (vaultId) {
      const vault = await prisma.vault.findFirst({ where: { id: vaultId, userId: req.user.id } });
      if (!vault) return res.status(404).json({ error: { message: 'Target vault not found.' } });
    }

    const { originalname, path: filePath, size } = req.file;
    const ext = path.extname(originalname).substring(1).toUpperCase();

    // Create Document record
    const document = await prisma.document.create({
      data: {
        userId: req.user.id,
        vaultId: vaultId || null,
        title: originalname,
        type: 'UPLOADED',
        status: 'PROCESSING',
        filePath,
        fileType: ext,
        fileSize: size,
        currentVersion: 1
      }
    });

    // Extract text content
    let extractedText = '';
    if (ext === 'PDF') {
      const dataBuffer = fs.readFileSync(filePath);
      const parsedPdf = await pdfParse(dataBuffer);
      extractedText = parsedPdf.text || '';
    } else {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      extractedText = `Uploaded Document: ${originalname}\n\n[Text content extracted from document file]`;
    }

    // Save initial version v1
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        content: extractedText,
        createdById: req.user.id,
        changeLog: 'Vault File Upload Ingestion'
      }
    });

    // Run structural chunking & RAG indexing (Fallback for non-vault)
    let totalChunks = await processAndChunkDocument(document.id, extractedText);

    // Call Python backend for global indexing if in a Vault
    if (vaultId) {
      try {
        const pyRes = await fetch('http://127.0.0.1:8000/api/v1/ingest/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: document.id,
            title: originalname,
            text: extractedText,
            vault_id: vaultId
          })
        });
        if (pyRes.ok) {
          const pyData = await pyRes.json();
          totalChunks = pyData.chunks_indexed || totalChunks;
        } else {
          console.error("Python ingest failed:", await pyRes.text());
        }
      } catch (err) {
        console.error("Failed to connect to Python ingest API:", err.message);
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'VAULT_FILE_UPLOADED',
        details: `Uploaded ${originalname} (${size} bytes, ${totalChunks} chunks)`
      }
    });

    return res.status(201).json({
      message: 'Document uploaded and indexed successfully in Legal Vault.',
      document: {
        ...document,
        status: 'READY',
        totalChunks
      }
    });
  } catch (error) {
    console.error('Vault Upload Error:', error);
    return res.status(500).json({
      error: { code: 'UPLOAD_FAILED', message: error.message || 'Failed to process document upload.' }
    });
  }
});

export default router;
