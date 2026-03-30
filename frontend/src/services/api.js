import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const registerUser = (userData) => API.post('/users/register', userData);
export const loginUser = (userData) => API.post('/users/login', userData);
export const getCurrentUser = () => API.get('/users/me');


export const uploadVideo = (formData, onUploadProgress) => 
  API.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const getAllVideos = () => API.get('/videos');
export const getFilteredVideos = (params) => API.get('/videos/filter', { params });
export const getVideoById = (id) => API.get(`/videos/${id}`);
export const deleteVideo = (id) => API.delete(`/videos/${id}`);
/* export const getStreamUrl = (id) => `http://localhost:8000/api/v1/videos/stream/${id}`; */


export const getAllUsers = () => API.get('/admin/users');
export const updateUserRole = (userId, role) => API.patch(`/admin/users/${userId}/role`, { role });
export const deleteUser = (userId) => API.delete(`/admin/users/${userId}`);
export const getSystemStats = () => API.get('/admin/stats');

export default API;