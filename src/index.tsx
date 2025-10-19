import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams, initData } from '@telegram-apps/sdk-react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';
import i18n from '@/i18n';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

import './index.css';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

// Configure dayjs
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

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

  // Configure all application dependencies first (this calls restoreInitData)
  await init({
    debug,
    eruda: debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  });

  // Now set language from Telegram user's language_code (after initData is restored)
  let language = 'en'; // Default to English
  try {
    const initDataState = initData.state();

    // Get language_code from Telegram user data
    const languageCode = initDataState?.user?.language_code;

    if (languageCode) {
      language = languageCode;
    } 
  } catch (e) {
    // If initData is not available (dev mode or error), use default
    console.error('Using default language (initData not available)', e);
  }

  // Map language code to supported languages (currently 'en' and 'ru')
  // For any Russian variant (ru, ru-RU, etc.), use 'ru', otherwise default to 'en'
  const supportedLanguages = ['en', 'ru'];
  let supportedLanguage = 'en';

  if (language.toLowerCase().startsWith('ru')) {
    supportedLanguage = 'ru';
  } else if (supportedLanguages.includes(language)) {
    supportedLanguage = language;
  }

  i18n.changeLanguage(supportedLanguage);
  dayjs.locale(supportedLanguage);

  root.render(
    <StrictMode>
      <Root/>
    </StrictMode>,
  );
} catch (e) {
  console.error('Failed to initialize app:', e);
  root.render(<EnvUnsupported/>);
}
