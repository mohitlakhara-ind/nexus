import api from './api';

export const getNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data;
};

export const markAllRead = async () => {
  const res = await api.put('/notifications/read-all');
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
};

export const createNotification = async (data) => {
  const res = await api.post('/notifications', data);
  return res.data;
};
