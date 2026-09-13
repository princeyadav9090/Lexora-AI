import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// List verified lawyers
router.get('/', async (req, res) => {
  const { specialization, location } = req.query;

  const whereClause = { isVerified: true };
  if (specialization) {
    whereClause.specialization = { contains: specialization };
  }
  if (location) {
    whereClause.location = { contains: location };
  }

  const lawyers = await prisma.lawyerProfile.findMany({
    where: whereClause,
    orderBy: { rating: 'desc' }
  });

  return res.json({ lawyers });
});

// Lawyer detail
router.get('/:id', async (req, res) => {
  const lawyer = await prisma.lawyerProfile.findUnique({
    where: { id: req.params.id }
  });

  if (!lawyer) {
    return res.status(404).json({
      error: { code: 'LAWYER_NOT_FOUND', message: 'Lawyer profile not found.' }
    });
  }

  return res.json({ lawyer });
});

export default router;
