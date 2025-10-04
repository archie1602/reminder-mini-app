import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';
import i18n from '@/i18n';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/ru';

import './index.css';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

// Configure dayjs
dayjs.extend(localizedFormat);

// Initialize MSW for development only
async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
  return Promise.resolve();
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

// Enable MSW mocking first (only in dev mode)
await enableMocking();

try {
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  const debug = (launchParams.tgWebAppStartParam || '').includes('platformer_debug')
    || import.meta.env.DEV;

  // Set language from Telegram
  const language = 'en'; // Default to English, will be enhanced later with proper Telegram init data
  const supportedLanguage = language.startsWith('ru') ? 'ru' : 'en';
  i18n.changeLanguage(supportedLanguage);
  dayjs.locale(supportedLanguage);

  // Configure all application dependencies.
  await init({
    debug,
    eruda: debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  });

  root.render(
    <StrictMode>
      <Root/>
    </StrictMode>,
  );
} catch (e) {
  console.error('Failed to initialize app:', e);
  root.render(<EnvUnsupported/>);
}
