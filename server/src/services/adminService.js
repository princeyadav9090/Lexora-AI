import prisma from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

export const adminService = {
  async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { documents: true, consultations: true }
        }
      }
    });
  },

  async updateUserStatus(adminUserId, targetUserId, status) {
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      throw new ApiError(400, 'Invalid status value. Must be ACTIVE or SUSPENDED.');
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'ADMIN_UPDATE_USER_STATUS',
        details: `Updated status of user ${targetUserId} to ${status}`
      }
    });

    return updatedUser;
  },

  async getAllLawyers() {
    return prisma.lawyerProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, status: true }
        }
      }
    });
  },

  async verifyLawyer(adminUserId, lawyerId, isVerified) {
    const updatedLawyer = await prisma.lawyerProfile.update({
      where: { id: lawyerId },
      data: { isVerified }
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'ADMIN_VERIFY_LAWYER',
        details: `Set verification status of lawyer ${lawyerId} to ${isVerified}`
      }
    });

    return updatedLawyer;
  },

  async getAuditLogs() {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
  }
};
