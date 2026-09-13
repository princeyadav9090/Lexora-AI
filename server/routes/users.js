import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get profile
router.get('/me', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true
    }
  });
  return res.json({ user });
});

// Update profile
router.patch('/me', authenticateToken, async (req, res) => {
  const { name } = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { name },
    select: { id: true, email: true, name: true, role: true }
  });
  return res.json({ user: updatedUser });
});

export default router;
