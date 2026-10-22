import api from './api.js';

export const communityService = {
  async getDepartments() {
    const res = await api.get('/communities/departments');
    return res.data.data;
  },

  async getClubs() {
    const res = await api.get('/communities/clubs');
    return res.data.data;
  },

  async getClubDetails(id) {
    const res = await api.get(`/communities/clubs/${id}`);
    return res.data.data;
  },

  async joinClub(id) {
    const res = await api.post(`/communities/clubs/${id}/join`);
    return res.data.data;
  },

  async leaveClub(id) {
    const res = await api.post(`/communities/clubs/${id}/leave`);
    return res.data.data;
  },

  async createClub(data) {
    const res = await api.post('/communities/clubs', data);
    return res.data.data;
  },
};
