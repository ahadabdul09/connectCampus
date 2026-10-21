import api from './api.js';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },

  async logout(refreshToken) {
    const res = await api.post('/auth/logout', { refreshToken });
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  async updateProfile(data) {
    const res = await api.patch('/users/me', data);
    return res.data.data;
  },

  async getCampusUsers(departmentId) {
    const res = await api.get('/users', { params: { departmentId } });
    return res.data.data;
  },
};
