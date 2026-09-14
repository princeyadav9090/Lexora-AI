import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { env } from './env.js';

const region = env.AWS_REGION;
const userPoolId = env.COGNITO_USER_POOL_ID;
const clientId = env.COGNITO_CLIENT_ID;

const isCognitoConfigured = Boolean(userPoolId && clientId);

let cognitoClient = null;
if (isCognitoConfigured) {
  cognitoClient = new CognitoIdentityProviderClient({ region });
}

export const cognitoAuth = {
  isConfigured: isCognitoConfigured,
  
  async registerUser(email, password, name) {
    if (!isCognitoConfigured) {
      return { isMocked: true, cognitoSub: `local-sub-${Date.now()}` };
    }
    try {
      const command = new SignUpCommand({
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name }
        ]
      });
      const response = await cognitoClient.send(command);
      return { isMocked: false, cognitoSub: response.UserSub };
    } catch (error) {
      console.error('AWS Cognito SignUp Error:', error);
      throw error;
    }
  },

  async authenticateUser(email, password) {
    if (!isCognitoConfigured) {
      return { isMocked: true };
    }
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });
      const response = await cognitoClient.send(command);
      return {
        isMocked: false,
        accessToken: response.AuthenticationResult.AccessToken,
        idToken: response.AuthenticationResult.IdToken,
        refreshToken: response.AuthenticationResult.RefreshToken
      };
    } catch (error) {
      console.error('AWS Cognito Auth Error:', error);
      throw error;
    }
  }
};
