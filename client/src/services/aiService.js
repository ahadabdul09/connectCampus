import api from './api.js';

export const aiService = {
  async query(data) {
    const res = await api.post('/ai/chat', data);
    return res.data.data;
  },

  async summarizeConversation(conversationId) {
    const res = await api.post('/ai/summarize', { conversationId });
    return res.data.data;
  },

  async getDeadlines(conversationId) {
    const res = await api.get('/ai/deadlines', { params: { conversationId } });
    return res.data.data;
  },
};
