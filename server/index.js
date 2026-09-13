import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import documentRoutes from './routes/documents.js';
import vaultRoutes from './routes/vault.js';
import assistantRoutes from './routes/assistant.js';
import lawyerRoutes from './routes/lawyers.js';
import consultationRoutes from './routes/consultations.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/admin', adminRoutes);

// System Health & Info Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Lexora AI Backend API Engine',
    timestamp: new Date().toISOString(),
    cognitoEnabled: Boolean(process.env.COGNITO_USER_POOL_ID)
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Middleware Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the server.'
    }
  });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`   🚀 Lexora AI Server running on port ${PORT}`);
  console.log(`   AWS Cognito: ${process.env.COGNITO_USER_POOL_ID ? 'CONNECTED' : 'LOCAL ADAPTER ACTIVE'}`);
  console.log(`==================================================`);
});
