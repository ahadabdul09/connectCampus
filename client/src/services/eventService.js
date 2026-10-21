import api from './api.js';

export const eventService = {
  async getEvents(params) {
    const res = await api.get('/events', { params });
    return res.data.data;
  },

  async createEvent(data) {
    const res = await api.post('/events', data);
    return res.data.data;
  },

  async registerForEvent(id) {
    const res = await api.post(`/events/${id}/register`);
    return res.data.data;
  },

  async cancelRegistration(id) {
    const res = await api.post(`/events/${id}/cancel`);
    return res.data.data;
  },
};
