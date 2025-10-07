import axios from 'axios';
import { retrieveLaunchParams, initData } from '@telegram-apps/sdk-react';

const apiClient = axios.create({
  baseURL: 'https://7zwh7t56-5119.euw.devtunnels.ms/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include Telegram auth
apiClient.interceptors.request.use((config) => {
  let authValue: string | undefined;

  try {
    // PRIORITY 1: Try to get from window.Telegram.WebApp.initData (official source with correct format)
    const tgWebApp = (window as any).Telegram?.WebApp;
    if (tgWebApp?.initData && typeof tgWebApp.initData === 'string' && tgWebApp.initData.length > 0) {
      authValue = tgWebApp.initData;
    }

    // PRIORITY 2: Try SDK's retrieveLaunchParams
    if (!authValue) {
      const launchParams = retrieveLaunchParams();
      const initDataRaw = launchParams.initDataRaw;

      if (initDataRaw && typeof initDataRaw === 'string' && initDataRaw.length > 0) {
        authValue = initDataRaw;
      }
    }

    // PRIORITY 3: Try initData module
    if (!authValue) {
      try {
        const initDataState = initData.state();
        if (initDataState && 'raw' in initDataState) {
          const raw = (initDataState as any).raw;
          if (raw && typeof raw === 'string' && raw.length > 0) {
            authValue = raw;
          }
        }
      } catch (e) {
        console.error('initData.state() not available');
      }
    }

    // FALLBACK for DEV mode only
    if (!authValue && import.meta.env.DEV) {
      authValue = 'dev-mode-fallback';
      console.info('⚠️ Using dev mode fallback');
    }
  } catch (error) {
    console.error('Error retrieving init data:', error);
  }

  if (authValue && authValue !== 'dev-mode-fallback') {
    config.headers['Authorization'] = `Tma ${authValue}`;
  } else if (authValue === 'dev-mode-fallback') {
    config.headers['Authorization'] = 'Tma dev-mode-fallback';
  } else {
    console.error('❌ No initData available - request will fail with 401');
  }
  return config;
});

export default apiClient;
