import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// List user consultations
router.get('/', authenticateToken, async (req, res) => {
  let consultations;
  if (req.user.role === 'LAWYER') {
    const lawyerProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.id }
    });
    consultations = await prisma.consultation.findMany({
      where: { lawyerId: lawyerProfile?.id || '' },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  } else {
    consultations = await prisma.consultation.findMany({
      where: { userId: req.user.id },
      include: { lawyer: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  return res.json({ consultations });
});

// Request consultation with double-booking prevention
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { lawyerId, date, time, issue } = req.body;

    if (!lawyerId || !date || !time || !issue) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Lawyer, date, time slot, and legal issue description are required.' }
      });
    }

    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: lawyerId }
    });

    if (!lawyer) {
      return res.status(404).json({
        error: { code: 'LAWYER_NOT_FOUND', message: 'Selected lawyer was not found.' }
      });
    }

    // Backend anti-double-booking validation check
    const existingBooking = await prisma.consultation.findFirst({
      where: {
        lawyerId,
        date,
        time,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        error: {
          code: 'SLOT_UNAVAILABLE',
          message: 'The selected lawyer is already booked for this time slot. Please choose another time or date.'
        }
      });
    }

    const consultation = await prisma.consultation.create({
      data: {
        userId: req.user.id,
        lawyerId,
        date,
        time,
        issue,
        status: 'CONFIRMED'
      },
      include: { lawyer: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CONSULTATION_REQUESTED',
        details: `Requested consultation with Advocate ${lawyer.name} on ${date} at ${time}`
      }
    });

    return res.status(201).json({
      message: 'Consultation request confirmed successfully.',
      consultation
    });
  } catch (error) {
    console.error('Consultation Booking Error:', error);
    return res.status(500).json({
      error: { code: 'BOOKING_FAILED', message: 'Failed to book consultation request.' }
    });
  }
});

export default router;
