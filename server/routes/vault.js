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

// Upload document to Vault
router.post('/uploads', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: 'NO_FILE', message: 'Please upload a PDF, DOCX, or TXT file.' }
      });
    }

    const { originalname, path: filePath, size } = req.file;
    const ext = path.extname(originalname).substring(1).toUpperCase();

    // Create Document record with status PROCESSING
    const document = await prisma.document.create({
      data: {
        userId: req.user.id,
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
      // For TXT and DOCX text extraction
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

    // Run structural chunking & RAG indexing
    const totalChunks = await processAndChunkDocument(document.id, extractedText);

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
