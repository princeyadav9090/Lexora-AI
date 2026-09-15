import { fetchClient } from './apiClient.js';

export const documentApi = {
  async getStats() {
    const cached = sessionStorage.getItem('lexora_stats');
    if (cached) return JSON.parse(cached);

    const res = await fetchClient('/documents/stats');
    const stats = res.stats || res;
    sessionStorage.setItem('lexora_stats', JSON.stringify(stats));
    return stats;
  },

  async getTemplates() {
    const res = await fetchClient('/documents/templates');
    return res.templates || res;
  },

  async generateDocument(payload) {
    sessionStorage.removeItem('lexora_documents');
    sessionStorage.removeItem('lexora_stats'); // Invalidate stats cache
    return fetchClient('/documents/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getDocuments() {
    const cached = sessionStorage.getItem('lexora_documents');
    if (cached) return JSON.parse(cached);

    const res = await fetchClient('/documents');
    const docs = res.documents || res;
    sessionStorage.setItem('lexora_documents', JSON.stringify(docs));
    return docs;
  },

  async getDocumentDetail(id) {
    const res = await fetchClient(`/documents/${id}`);
    return res.document || res;
  },

  async updateDocument(id, content, title, changeLog) {
    sessionStorage.removeItem('lexora_documents');
    sessionStorage.removeItem('lexora_stats'); // Invalidate stats cache
    return fetchClient(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content, title, changeLog })
    });
  },

  async signDocument(id) {
    return fetchClient(`/documents/${id}/sign`, {
      method: 'POST'
    });
  },

  async deleteDocument(id) {
    sessionStorage.removeItem('lexora_documents');
    sessionStorage.removeItem('lexora_stats'); // Invalidate stats cache
    return fetchClient(`/documents/${id}`, {
      method: 'DELETE'
    });
  }
};
