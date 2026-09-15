import { fetchClient } from './apiClient.js';

export const authApi = {
  async login(email, password) {
    return fetchClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(name, email, password, role = 'USER') {
    return fetchClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
  },

  async getCurrentUser() {
    try {
      const res = await fetchClient('/auth/me');
      return res.user || res;
    } catch {
      return null;
    }
  },

  async logout() {
    try {
      await fetchClient('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout request warning:', e);
    } finally {
      localStorage.removeItem('lexora_token');
      localStorage.removeItem('lexora_user');
    }
  }
};
