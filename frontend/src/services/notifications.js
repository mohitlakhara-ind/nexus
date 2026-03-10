import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'https://nexus-p2eh.onrender.com'}/api`;

const getHeaders = () => {
  const token = localStorage.getItem('nexus_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getNotifications = async () => {
  const res = await axios.get(`${API_URL}/notifications`, { headers: getHeaders() });
  return res.data;
};

export const markAllRead = async () => {
  const res = await axios.put(`${API_URL}/notifications/read-all`, {}, { headers: getHeaders() });
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await axios.put(`${API_URL}/notifications/${id}/read`, {}, { headers: getHeaders() });
  return res.data;
};

export const createNotification = async (data) => {
  const res = await axios.post(`${API_URL}/notifications`, data, { headers: getHeaders() });
  return res.data;
};
