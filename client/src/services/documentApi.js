import { fetchClient } from './apiClient.js';

export const documentApi = {
  async getStats() {
    const res = await fetchClient('/documents/stats');
    return res.stats || res;
  },

  async getTemplates() {
    const res = await fetchClient('/documents/templates');
    return res.templates || res;
  },

  async generateDocument(documentType, title, answers) {
    return fetchClient('/documents/generate', {
      method: 'POST',
      body: JSON.stringify({ documentType, title, answers })
    });
  },

  async getDocuments() {
    const res = await fetchClient('/documents');
    return res.documents || res;
  },

  async getDocumentDetail(id) {
    const res = await fetchClient(`/documents/${id}`);
    return res.document || res;
  },

  async updateDocument(id, content, title, changeLog) {
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
    return fetchClient(`/documents/${id}`, {
      method: 'DELETE'
    });
  }
};
