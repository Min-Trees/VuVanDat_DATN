import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vdbus_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('vdbus_refresh_token');
      const accessToken = localStorage.getItem('vdbus_access_token');

      if (refreshToken && accessToken) {
        try {
          const res = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
            accessToken,
            refreshToken,
          });
          const newAccess = res.data.accessToken;
          const newRefresh = res.data.refreshToken;
          localStorage.setItem('vdbus_access_token', newAccess);
          localStorage.setItem('vdbus_refresh_token', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch {
          localStorage.removeItem('vdbus_access_token');
          localStorage.removeItem('vdbus_refresh_token');
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);
