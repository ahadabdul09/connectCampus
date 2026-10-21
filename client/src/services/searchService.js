import api from './api.js';

export const searchService = {
  async search(query) {
    const res = await api.get('/search', { params: { q: query } });
    return res.data.data;
  },
};
