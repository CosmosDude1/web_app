import api from './api';

export const userService = {
  getAll: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  }
};

