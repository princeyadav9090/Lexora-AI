import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Admin middleware protection
router.use(authenticateToken, requireRole('ADMIN'));

// List users
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return res.json({ users });
});

// Update user status (Activate / Suspend)
router.patch('/users/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    return res.status(400).json({ error: { message: 'Invalid status value.' } });
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: { status }
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'ADMIN_USER_STATUS_UPDATED',
      details: `Changed user ${req.params.id} status to ${status}`
    }
  });

  return res.json({ user: updatedUser });
});

// List lawyers for verification management
router.get('/lawyers', async (req, res) => {
  const lawyers = await prisma.lawyerProfile.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return res.json({ lawyers });
});

// Toggle lawyer verification status
router.patch('/lawyers/:id/verify', async (req, res) => {
  const { isVerified } = req.body;
  const updatedLawyer = await prisma.lawyerProfile.update({
    where: { id: req.params.id },
    data: { isVerified: Boolean(isVerified) }
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'ADMIN_LAWYER_VERIFIED_TOGGLE',
      details: `Updated lawyer ${req.params.id} verification to ${isVerified}`
    }
  });

  return res.json({ lawyer: updatedLawyer });
});

// Audit logs
router.get('/audit-logs', async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { email: true, name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  return res.json({ auditLogs: logs });
});

export default router;
