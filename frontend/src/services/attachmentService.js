import api from './api';

export const attachmentService = {
  getByTaskId: async (taskId) => {
    const response = await api.get(`/attachments/task/${taskId}`);
    return response.data;
  },

  download: async (attachmentId) => {
    const response = await api.get(`/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  delete: async (attachmentId) => {
    await api.delete(`/attachments/${attachmentId}`);
  }
};

