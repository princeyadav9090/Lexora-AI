import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`   🚀 Lexora AI Enterprise Server running on port ${PORT}`);
  console.log(`   AWS Cognito: ${env.COGNITO_USER_POOL_ID ? 'CONNECTED' : 'LOCAL ADAPTER ACTIVE'}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================`);
});
