import axios from 'axios';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

const apiClient = axios.create({
  baseURL: 'https://7zwh7t56-5119.euw.devtunnels.ms//v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include Telegram auth
apiClient.interceptors.request.use((config) => {
  try {
    const { initDataRaw } = retrieveLaunchParams();
    if (initDataRaw) {
      config.headers.Authorization = `tma ${initDataRaw}`;
    } else if (import.meta.env.DEV) {
      // Fallback for dev mode
      config.headers.Authorization = 'tma dev-mode-fallback';
    }
  } catch (error) {
    // If retrieveLaunchParams fails, use dev fallback
    if (import.meta.env.DEV) {
      config.headers.Authorization = 'tma dev-mode-fallback';
    }
  }
  return config;
});

export default apiClient;
