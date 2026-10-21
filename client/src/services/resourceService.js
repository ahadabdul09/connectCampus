import api from './api.js';

export const resourceService = {
  async getResources(params) {
    const res = await api.get('/resources', { params });
    return res.data.data;
  },

  async uploadResource(formData) {
    const res = await api.post('/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  async recordDownload(id) {
    const res = await api.post(`/resources/${id}/download`);
    return res.data.data;
  },
};
