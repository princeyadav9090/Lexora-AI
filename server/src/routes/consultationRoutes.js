import express from 'express';
import { bookConsultation, getConsultations } from '../controllers/consultationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, bookConsultation);
router.get('/', authenticateToken, getConsultations);

export default router;
