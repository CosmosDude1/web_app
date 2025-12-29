import api from './api';

export const taskService = {
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  update: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get('/calendar/tasks', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};






