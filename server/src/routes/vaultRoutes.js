import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadVaultFile } from '../controllers/vaultController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const uploadDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

const router = express.Router();

router.post('/uploads', authenticateToken, upload.single('file'), uploadVaultFile);

export default router;
