import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const lawyerService = {
  async getLawyers({ specialization, location }) {
    const where = { isVerified: true };
    if (specialization) {
      where.specialization = { contains: specialization };
    }
    if (location) {
      where.location = { contains: location };
    }

    return prisma.lawyerProfile.findMany({
      where,
      orderBy: { rating: 'desc' },
      include: {
        user: {
          select: { email: true, status: true }
        }
      }
    });
  },

  async getLawyerDetail(lawyerId) {
    const lawyer = await prisma.lawyerProfile.findUnique({
      where: { id: lawyerId },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });

    if (!lawyer) {
      throw new ApiError(404, 'Lawyer profile not found.');
    }

    return lawyer;
  }
};
