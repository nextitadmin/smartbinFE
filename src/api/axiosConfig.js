import axios from 'axios';
import useTokenStore from '../store/tokenStore';
import useAuthStore from '../store/authStore';
import useResidentStore from '../store/useResidentStore';

const api = axios.create({
  baseURL: 'https://smartbin-be.next-itservices.com/api/v1/',
  // baseURL: 'https://4dd1-2a09-bac5-4dd1-c8-00-14-2eb.ngrok-free.app/api/v1/',
});

api.interceptors.request.use((config) => {
  const token = useTokenStore.getState().bearerToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => {
    // If the backend returns success: false with message: "Invalid authentication token", treat it as unauthorized
    if (response.data && response.data.success === false && (
      response.data.message?.toLowerCase().includes('token') || 
      response.data.message?.toLowerCase().includes('auth') ||
      response.data.message?.toLowerCase().includes('unauthorized')
    )) {
      useTokenStore.getState().clearBearerToken();
      useAuthStore.getState().logout();
      useResidentStore.getState().clearResidentInfo();
      window.location.href = '/';
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || '';
      
      if (status === 401 || status === 403 || msg.toLowerCase().includes('token') || msg.toLowerCase().includes('auth')) {
        useTokenStore.getState().clearBearerToken();
        useAuthStore.getState().logout();
        useResidentStore.getState().clearResidentInfo();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
