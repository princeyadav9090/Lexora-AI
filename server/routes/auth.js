import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { cognitoAuth } from '../config/cognito.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'lexora_ai_super_secret_jwt_key_2026_india';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'USER' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Name, email, and password are required.' }
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: { code: 'EMAIL_IN_USE', message: 'An account with this email already exists.' }
      });
    }

    // Hash password locally
    const passwordHash = await bcrypt.hash(password, 10);

    // Register via AWS Cognito adapter if enabled
    let cognitoSub = null;
    try {
      const cognitoRes = await cognitoAuth.registerUser(email, password, name);
      cognitoSub = cognitoRes.cognitoSub;
    } catch (cognitoErr) {
      console.warn('Cognito registration warning:', cognitoErr.message);
    }

    // Protect role escalation: Only allow LAWYER or USER registration via public signup
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

    // If lawyer role, create lawyer profile draft
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

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        action: 'USER_REGISTERED',
        details: `User registered with role ${userRole}`
      }
    });

    // Generate session JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      authProvider: cognitoAuth.isConfigured ? 'AWS Cognito' : 'Local Authentication'
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to process user registration.' }
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Email and password are required.' }
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Account is suspended. Contact support.' }
      });
    }

    // Verify password locally
    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
    if (!isValidPassword) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    // Optional Cognito authentication attempt
    if (cognitoAuth.isConfigured) {
      try {
        await cognitoAuth.authenticateUser(email, password);
      } catch (err) {
        console.warn('Cognito login warning:', err.message);
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: 'User logged in successfully'
      }
    });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      authProvider: cognitoAuth.isConfigured ? 'AWS Cognito' : 'Local Authentication'
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to process login.' }
    });
  }
});

// Current User profile
router.get('/me', authenticateToken, async (req, res) => {
  return res.json({ user: req.user });
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'USER_LOGOUT',
      details: 'User logged out'
    }
  });
  return res.json({ message: 'Logged out successfully' });
});

export default router;
