import api from './api.js';

export const chatService = {
  async getConversations() {
    const res = await api.get('/chat/conversations');
    return res.data.data;
  },

  async getConversationDetails(id) {
    const res = await api.get(`/chat/conversations/${id}`);
    return res.data.data;
  },

  async createConversation(data) {
    const res = await api.post('/chat/conversations', data);
    return res.data.data;
  },

  async getMessages(conversationId, limit = 50, cursor) {
    const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { limit, cursor },
    });
    return res.data.data;
  },

  async sendMessage(conversationId, data) {
    const res = await api.post(`/chat/conversations/${conversationId}/messages`, data);
    return res.data.data;
  },

  async editMessage(messageId, content) {
    const res = await api.patch(`/chat/messages/${messageId}`, { content });
    return res.data.data;
  },

  async deleteMessage(messageId) {
    const res = await api.delete(`/chat/messages/${messageId}`);
    return res.data.data;
  },

  async togglePin(messageId) {
    const res = await api.post(`/chat/messages/${messageId}/pin`);
    return res.data.data;
  },

  async addReaction(messageId, emoji) {
    const res = await api.post(`/chat/messages/${messageId}/reactions`, { emoji });
    return res.data.data;
  },

  async removeReaction(messageId, emoji) {
    const res = await api.delete(`/chat/messages/${messageId}/reactions`, { data: { emoji } });
    return res.data.data;
  },

  async markAsRead(conversationId) {
    const res = await api.post(`/chat/conversations/${conversationId}/read`);
    return res.data.data;
  },
};
