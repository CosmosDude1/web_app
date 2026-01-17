import api from './api';

export const activityLogService = {
  getByTask: async (taskId) => {
    const response = await api.get(`/activitylogs/task/${taskId}`);
    return response.data;
  },

  getByProject: async (projectId) => {
    const response = await api.get(`/activitylogs/project/${projectId}`);
    return response.data;
  },

  getRecent: async (limit = 20) => {
    const response = await api.get(`/activitylogs/recent?limit=${limit}`);
    return response.data;
  },
};

