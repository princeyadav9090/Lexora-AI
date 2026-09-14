import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import documentRoutes from './documentRoutes.js';
import assistantRoutes from './assistantRoutes.js';
import lawyerRoutes from './lawyerRoutes.js';
import consultationRoutes from './consultationRoutes.js';
import adminRoutes from './adminRoutes.js';
import vaultRoutes from './vaultRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/documents', documentRoutes);
router.use('/assistant', assistantRoutes);
router.use('/lawyers', lawyerRoutes);
router.use('/consultations', consultationRoutes);
router.use('/admin', adminRoutes);
router.use('/vault', vaultRoutes);

export default router;
