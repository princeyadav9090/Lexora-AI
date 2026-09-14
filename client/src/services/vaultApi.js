import { fetchClient } from './apiClient.js';

export const vaultApi = {
  async uploadVaultFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return fetchClient('/vault/uploads', {
      method: 'POST',
      body: formData
    });
  }
};
