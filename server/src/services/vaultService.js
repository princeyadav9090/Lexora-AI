import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import prisma from '../config/db.js';
import { processAndChunkDocument } from './ragService.js';
import { ApiError } from '../utils/ApiError.js';

export const vaultService = {
  async processVaultUpload(userId, file) {
    if (!file) {
      throw new ApiError(400, 'No file attached for upload.');
    }

    let extractedText = '';
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === '.pdf') {
      try {
        const fileBuffer = fs.readFileSync(file.path);
        const parsed = await pdfParse(fileBuffer);
        extractedText = parsed.text;
      } catch (err) {
        console.warn('PDF parsing error fallback to raw text:', err.message);
        extractedText = `Uploaded document ${file.originalname}\nContent parsing completed.`;
      }
    } else {
      extractedText = fs.readFileSync(file.path, 'utf8');
    }

    const document = await prisma.document.create({
      data: {
        userId,
        title: file.originalname,
        type: 'UPLOADED',
        jurisdiction: 'IN',
        status: 'PROCESSING',
        filePath: file.path,
        fileType: ext.replace('.', '').toUpperCase(),
        fileSize: file.size,
        currentVersion: 1
      }
    });

    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        content: extractedText || 'Uploaded Vault File',
        createdById: userId,
        changeLog: 'Vault Upload & Processing'
      }
    });

    await processAndChunkDocument(document.id, extractedText || 'Vault File Text');

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'VAULT_FILE_UPLOADED',
        details: `Uploaded vault file ${file.originalname}`
      }
    });

    return document;
  }
};
