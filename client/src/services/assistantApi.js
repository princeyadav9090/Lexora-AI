import { fetchClient } from './apiClient.js';

export const assistantApi = {
  async getConversations() {
    const cached = sessionStorage.getItem('lexora_chats');
    if (cached) return JSON.parse(cached);

    const res = await fetchClient('/assistant/conversations');
    const chats = res.conversations || res;
    sessionStorage.setItem('lexora_chats', JSON.stringify(chats));
    return chats;
  },

  async createConversation(title, documentId, contextMode) {
    sessionStorage.removeItem('lexora_chats'); // Invalidate cache
    const res = await fetchClient('/assistant/conversations', {
      method: 'POST',
      body: JSON.stringify({ title, documentId, contextMode })
    });
    return res.conversation || res;
  },

  async sendMessage(conversationId, content) {
    sessionStorage.removeItem('lexora_chats'); // Invalidate cache
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
  },

  async deleteConversation(conversationId) {
    sessionStorage.removeItem('lexora_chats'); // Invalidate cache
    return fetchClient(`/assistant/conversations/${conversationId}`, {
      method: 'DELETE'
    });
  }
};
