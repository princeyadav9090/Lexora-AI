import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { env } from './config/env.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Base API Routes
app.use('/api', routes);

// System Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Lexora AI Enterprise API Engine',
    timestamp: new Date().toISOString(),
    cognitoEnabled: Boolean(env.COGNITO_USER_POOL_ID)
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
