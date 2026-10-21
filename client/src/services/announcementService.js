import api from './api.js';

export const announcementService = {
  async getAnnouncements(params) {
    const res = await api.get('/announcements', { params });
    return res.data.data;
  },

  async createAnnouncement(data) {
    const res = await api.post('/announcements', data);
    return res.data.data;
  },

  async deleteAnnouncement(id) {
    const res = await api.delete(`/announcements/${id}`);
    return res.data.data;
  },
};
