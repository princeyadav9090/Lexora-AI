import express from 'express';
import {
  getUsers,
  updateUserStatus,
  getLawyers,
  verifyLawyer,
  getAuditLogs
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/lawyers', getLawyers);
router.patch('/lawyers/:id/verify', verifyLawyer);
router.get('/audit-logs', getAuditLogs);

export default router;
