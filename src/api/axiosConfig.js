import axios from 'axios';
import useTokenStore from '../store/tokenStore'; 

const api = axios.create({
  baseURL: 'https://smartbin-be.next-itservices.com/api/v1/',
});

api.interceptors.request.use((config) => {
  const token = useTokenStore.getState().bearerToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
