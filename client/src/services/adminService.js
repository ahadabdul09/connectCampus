import api from './api.js';

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },

  async updateUser(id, data) {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data.data;
  },

  async inviteUser(data) {
    const res = await api.post('/admin/users/invite', data);
    return res.data.data;
  },

  async getInvitations() {
    const res = await api.get('/admin/invitations');
    return res.data.data;
  },

  async revokeInvitation(id) {
    const res = await api.delete(`/admin/invitations/${id}`);
    return res.data.data;
  },

  async createDepartment(data) {
    const res = await api.post('/admin/departments', data);
    return res.data.data;
  },

  async deleteDepartment(id) {
    const res = await api.delete(`/admin/departments/${id}`);
    return res.data.data;
  },

  async createClub(data) {
    const res = await api.post('/admin/clubs', data);
    return res.data.data;
  },

  async deleteClub(id) {
    const res = await api.delete(`/admin/clubs/${id}`);
    return res.data.data;
  },

  async uploadDocument(data) {
    const res = await api.post('/ai/documents', data);
    return res.data.data;
  },

  async resolveReport(id, status, resolution) {
    const res = await api.patch(`/admin/reports/${id}`, { status, resolution });
    return res.data.data;
  },
};
