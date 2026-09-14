import { fetchClient } from './apiClient.js';

export const adminApi = {
  async getAdminUsers() {
    const res = await fetchClient('/admin/users');
    return res.users || res;
  },

  async updateUserStatus(userId, status) {
    return fetchClient(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async getAdminLawyers() {
    const res = await fetchClient('/admin/lawyers');
    return res.lawyers || res;
  },

  async verifyLawyer(lawyerId, isVerified) {
    return fetchClient(`/admin/lawyers/${lawyerId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified })
    });
  },

  async getAuditLogs() {
    const res = await fetchClient('/admin/audit-logs');
    return res.auditLogs || res;
  }
};
