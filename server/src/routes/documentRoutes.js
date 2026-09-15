import express from 'express';
import {
  getTemplates,
  getStats,
  generateDocument,
  getDocuments,
  getDocumentDetail,
  updateDocument,
  signDocument,
  deleteDocument
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/templates', authenticateToken, getTemplates);
router.get('/stats', authenticateToken, getStats);
router.post('/generate', authenticateToken, generateDocument);
router.get('/', authenticateToken, getDocuments);
router.get('/:id', authenticateToken, getDocumentDetail);
router.patch('/:id', authenticateToken, updateDocument);
router.post('/:id/sign', authenticateToken, signDocument);
router.delete('/:id', authenticateToken, deleteDocument);

export default router;
