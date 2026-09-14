import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const consultationService = {
  async bookConsultation(userId, { lawyerId, date, time, issue }) {
    if (!lawyerId || !date || !time || !issue) {
      throw new ApiError(400, 'Lawyer ID, date, time, and issue description are required.');
    }

    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: lawyerId }
    });

    if (!lawyer) {
      throw new ApiError(404, 'Selected lawyer profile does not exist.');
    }

    const consultation = await prisma.consultation.create({
      data: {
        userId,
        lawyerId,
        date,
        time,
        issue,
        status: 'CONFIRMED'
      },
      include: {
        lawyer: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CONSULTATION_BOOKED',
        details: `Booked consultation with ${lawyer.name} for ${date} at ${time}`
      }
    });

    return consultation;
  },

  async getUserConsultations(userId, role) {
    if (role === 'LAWYER') {
      const lawyerProfile = await prisma.lawyerProfile.findUnique({
        where: { userId }
      });
      if (!lawyerProfile) return [];

      return prisma.consultation.findMany({
        where: { lawyerId: lawyerProfile.id },
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });
    }

    return prisma.consultation.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        lawyer: true
      }
    });
  }
};
