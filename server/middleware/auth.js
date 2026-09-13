import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'lexora_ai_super_secret_jwt_key_2026_india';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required.' }
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, status: true }
    });

    if (!user) {
      return res.status(401).json({
        error: { code: 'USER_NOT_FOUND', message: 'User account not found.' }
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended. Please contact admin.' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired authorization token.' }
    });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
        }
      });
    }
    next();
  };
};
