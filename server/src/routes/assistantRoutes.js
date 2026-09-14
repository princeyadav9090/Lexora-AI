import express from 'express';
import {
  getConversations,
  createConversation,
  sendMessage,
  explainClause
} from '../controllers/assistantController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/conversations', authenticateToken, getConversations);
router.post('/conversations', authenticateToken, createConversation);
router.post('/conversations/:id/messages', authenticateToken, sendMessage);
router.post('/explain-clause', authenticateToken, explainClause);

export default router;
