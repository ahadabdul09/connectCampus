import api from './api.js';

export const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  async markAsRead(id) {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllAsRead() {
    const res = await api.post('/notifications/read-all');
    return res.data.data;
  },
};
