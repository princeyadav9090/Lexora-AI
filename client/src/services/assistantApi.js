import { fetchClient } from './apiClient.js';

export const assistantApi = {
  async getConversations() {
    const res = await fetchClient('/assistant/conversations');
    return res.conversations || res;
  },

  async createConversation(title, documentId, contextMode) {
    const res = await fetchClient('/assistant/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, documentId, contextMode })
    });
    return res.conversation || res;
  },

  async sendMessage(conversationId, content) {
    return fetchClient(`/assistant/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },

  async explainClause(clauseText) {
    return fetchClient('/assistant/explain-clause', {
      method: 'POST',
      body: JSON.stringify({ clauseText })
    });
  }
};
