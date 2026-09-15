import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'lexora_ai_jwt_secret_key_change_in_production',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  
  // AWS Cognito Configuration
  AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID || '',
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || '',
  
  // AI Keys
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Seed Configuration
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || 'admin@lexora.ai',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'LexoraPass123!',
  SEED_USER_PASSWORD: process.env.SEED_USER_PASSWORD || 'LexoraPass123!'
};
