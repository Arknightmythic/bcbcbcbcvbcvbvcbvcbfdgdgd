import axios from 'axios';
import { useAuthStore } from '../store/authStore';


const instanceApi = axios.create({
  baseURL: import.meta.env.VITE_API_BE_URL,
  timeout: 10000,
  withCredentials: true, 
});

export const instanceApiToken = axios.create({
  baseURL: import.meta.env.VITE_API_BE_URL,
  timeout: 10000,
  withCredentials: true, 
});

instanceApiToken.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


instanceApiToken.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await instanceApi.post('/auth/refresh');
        const newAccessToken = data.data.access_token;
        useAuthStore.getState().actions.refreshToken(newAccessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return instanceApiToken(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().actions.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instanceApi;