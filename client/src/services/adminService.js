import api from './api.js';

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data.data;
  },

  async getUsers(page = 1, limit = 20, search) {
    const res = await api.get('/admin/users', { params: { page, limit, search } });
    return res.data.data;
  },

  async resolveReport(id, status, resolution) {
    const res = await api.patch(`/admin/reports/${id}`, { status, resolution });
    return res.data.data;
  },
};
