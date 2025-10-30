import axios from 'axios';
import { useAuthStore } from '../store/authStore';


const instanceApi = axios.create({
  baseURL: import.meta.env.VITE_API_BE_URL,
  timeout: 10000,
  withCredentials: true, // <-- PENTING: Tambahkan ini agar cookie dikirim
});

export const instanceApiToken = axios.create({
  baseURL: import.meta.env.VITE_API_BE_URL,
  timeout: 10000,
  withCredentials: true, // <-- PENTING: Tambahkan ini juga
});

// Interceptor request (tetap sama)
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

// Interceptor response (tetap sama, karena `withCredentials` sudah di-set)
instanceApiToken.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Request ini sekarang akan otomatis mengirim HttpOnly cookie
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