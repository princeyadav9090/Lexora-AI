import { cognitoAuth } from '../server/src/config/cognito.js';

async function testCognito() {
  console.log('Testing AWS Cognito Service...');
  console.log('Is Configured:', cognitoAuth.isConfigured);

  if (!cognitoAuth.isConfigured) {
    console.log('Cognito is NOT configured in .env');
    return;
  }

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User';

  try {
    console.log(`Attempting to register user: ${testEmail}...`);
    const regResult = await cognitoAuth.registerUser(testEmail, testPassword, testName);
    console.log('✅ Registration Result:', regResult);
  } catch (err) {
    console.error('❌ Cognito SignUp Error:', err.message);
  }
}

testCognito();
