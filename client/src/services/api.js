const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('lexora_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Login failed');
    return data;
  },

  async register(name, email, password, role = 'USER') {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Registration failed');
    return data;
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (e) {
      console.warn('Logout request warning:', e);
    } finally {
      localStorage.removeItem('lexora_token');
      localStorage.removeItem('lexora_user');
    }
  },

  // Documents Generator
  async getStats() {
    const res = await fetch(`${API_BASE}/documents/stats`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch dashboard stats');
    return data.stats;
  },

  async getTemplates() {
    const res = await fetch(`${API_BASE}/documents/templates`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch templates');
    return data.templates;
  },

  async generateDocument(documentType, title, answers) {
    const res = await fetch(`${API_BASE}/documents/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ documentType, title, answers })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to generate document');
    return data;
  },

  async getDocuments() {
    const res = await fetch(`${API_BASE}/documents`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch documents');
    return data.documents;
  },

  async getDocumentDetail(id) {
    const res = await fetch(`${API_BASE}/documents/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch document detail');
    return data.document;
  },

  async updateDocument(id, content, title, changeLog) {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ content, title, changeLog })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to update document');
    return data;
  },

  async signDocument(id) {
    const res = await fetch(`${API_BASE}/documents/${id}/sign`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to sign document');
    return data;
  },

  async deleteDocument(id) {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to delete document');
    return data;
  },

  // Vault Upload
  async uploadVaultFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/vault/uploads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to upload document');
    return data;
  },

  // AI Assistant
  async getConversations() {
    const res = await fetch(`${API_BASE}/assistant/conversations`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch conversations');
    return data.conversations;
  },

  async createConversation(title, documentId, contextMode) {
    const res = await fetch(`${API_BASE}/assistant/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ title, documentId, contextMode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to create conversation');
    return data.conversation;
  },

  async sendMessage(conversationId, content) {
    const res = await fetch(`${API_BASE}/assistant/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to send AI query');
    return data;
  },

  async explainClause(clauseText) {
    const res = await fetch(`${API_BASE}/assistant/explain-clause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ clauseText })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to explain clause');
    return data;
  },

  // Lawyer Marketplace
  async getLawyers(specialization, location) {
    const params = new URLSearchParams();
    if (specialization) params.append('specialization', specialization);
    if (location) params.append('location', location);

    const res = await fetch(`${API_BASE}/lawyers?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch lawyers');
    return data.lawyers;
  },

  async getLawyerDetail(id) {
    const res = await fetch(`${API_BASE}/lawyers/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch lawyer detail');
    return data.lawyer;
  },

  async bookConsultation(lawyerId, date, time, issue) {
    const res = await fetch(`${API_BASE}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ lawyerId, date, time, issue })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to book consultation');
    return data;
  },

  async getConsultations() {
    const res = await fetch(`${API_BASE}/consultations`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch consultations');
    return data.consultations;
  },

  // Admin Panel
  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch users');
    return data.users;
  },

  async updateUserStatus(userId, status) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to update user status');
    return data;
  },

  async getAdminLawyers() {
    const res = await fetch(`${API_BASE}/admin/lawyers`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch admin lawyers');
    return data.lawyers;
  },

  async verifyLawyer(lawyerId, isVerified) {
    const res = await fetch(`${API_BASE}/admin/lawyers/${lawyerId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ isVerified })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to verify lawyer');
    return data;
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch audit logs');
    return data.auditLogs;
  }
};
