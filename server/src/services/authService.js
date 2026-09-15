import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { cognitoAuth } from '../config/cognito.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const authService = {
  async register({ name, email, password, role = 'USER' }) {
    if (!email || !password || !name) {
      throw new ApiError(400, 'Name, email, and password are required.');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(400, 'An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let cognitoSub = null;
    try {
      const cognitoRes = await cognitoAuth.registerUser(email, password, name);
      cognitoSub = cognitoRes.cognitoSub;
    } catch (cognitoErr) {
      console.warn('Cognito registration warning:', cognitoErr.message);
    }

    const userRole = (role === 'LAWYER' || role === 'USER') ? role : 'USER';

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        cognitoSub,
        role: userRole,
        status: 'ACTIVE'
      }
    });

    if (userRole === 'LAWYER') {
      await prisma.lawyerProfile.create({
        data: {
          userId: newUser.id,
          name,
          specialization: 'Corporate & Contract Law',
          experience: 5,
          languages: 'English, Hindi',
          location: 'New Delhi, India',
          fee: 2500,
          bio: 'Legal professional specializing in contract draft reviews, NDA compliance, and corporate litigation.',
          isVerified: true
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        action: 'USER_REGISTERED',
        details: `User registered with role ${userRole}`
      }
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      authProvider: cognitoAuth.isConfigured ? 'AWS Cognito' : 'Local Authentication'
    };
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (user.status === 'SUSPENDED') {
      throw new ApiError(403, 'Account is suspended. Contact support.');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (cognitoAuth.isConfigured) {
      try {
        await cognitoAuth.authenticateUser(email, password);
      } catch (err) {
        console.warn('Cognito login warning:', err.message);
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: 'User logged in successfully'
      }
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      authProvider: cognitoAuth.isConfigured ? 'AWS Cognito' : 'Local Authentication'
    };
  },

  async logout(userId) {
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'USER_LOGOUT',
          details: 'User logged out'
        }
      });
    }
  }
};
