import express from 'express';
import { getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', authenticateToken, getCurrentUser);

export default router;
