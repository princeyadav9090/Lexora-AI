import { authApi } from './authApi.js';
import { documentApi } from './documentApi.js';
import { assistantApi } from './assistantApi.js';
import { lawyerApi } from './lawyerApi.js';
import { adminApi } from './adminApi.js';
import { vaultApi } from './vaultApi.js';

export const api = {
  // Auth
  login: authApi.login,
  register: authApi.register,
  getCurrentUser: authApi.getCurrentUser,
  logout: authApi.logout,

  // Documents
  getStats: documentApi.getStats,
  getTemplates: documentApi.getTemplates,
  generateDocument: documentApi.generateDocument,
  getDocuments: documentApi.getDocuments,
  getDocumentDetail: documentApi.getDocumentDetail,
  updateDocument: documentApi.updateDocument,
  signDocument: documentApi.signDocument,
  deleteDocument: documentApi.deleteDocument,

  // Vault
  uploadVaultFile: vaultApi.uploadVaultFile,

  // AI Assistant
  getConversations: assistantApi.getConversations,
  createConversation: assistantApi.createConversation,
  sendMessage: assistantApi.sendMessage,
  explainClause: assistantApi.explainClause,

  // Lawyers & Consultations
  getLawyers: lawyerApi.getLawyers,
  getLawyerDetail: lawyerApi.getLawyerDetail,
  bookConsultation: lawyerApi.bookConsultation,
  getConsultations: lawyerApi.getConsultations,

  // Admin
  getAdminUsers: adminApi.getAdminUsers,
  updateUserStatus: adminApi.updateUserStatus,
  getAdminLawyers: adminApi.getAdminLawyers,
  verifyLawyer: adminApi.verifyLawyer,
  getAuditLogs: adminApi.getAuditLogs
};
