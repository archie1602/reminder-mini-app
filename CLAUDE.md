# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. 

## Project Overview

This is a Telegram Mini App built with React, TypeScript, and Vite. It demonstrates integration with the Telegram Mini Apps platform.

**Key Technologies:**
- React 18 with TypeScript
- [@telegram-apps/sdk-react](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react) for Telegram integration
- Vite for build tooling
- React Router (HashRouter) for client-side routing

## Development Commands

```bash
# Install dependencies (must use npm, not yarn/pnpm)
npm install

# Development server (uses HTTP)
npm run dev

# Development server with HTTPS (requires sudo on first run for SSL cert generation)
npm run dev:https

# Type-check and build for production
npm run build

# Lint code
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Preview production build locally
npm run preview

# Deploy to GitHub Pages (requires build first)
npm run deploy
```

## Architecture

### Application Initialization Flow

1. **[src/index.tsx](src/index.tsx)** - Entry point that:
   - Imports [src/mockEnv.ts](src/mockEnv.ts) to enable local development outside Telegram
   - Calls `retrieveLaunchParams()` to get Telegram launch parameters
   - Calls `init()` from [src/init.ts](src/init.ts) to configure SDK and mount components
   - Renders the `<Root>` component or `<EnvUnsupported>` if initialization fails

2. **[src/init.ts](src/init.ts)** - Initializes the Telegram SDK:
   - Configures debug mode and Eruda debugger (for mobile)
   - Handles macOS-specific Telegram client bugs with custom mocking
   - Mounts SDK components: BackButton, MiniApp, Viewport
   - Binds theme and viewport CSS variables

3. **[src/mockEnv.ts](src/mockEnv.ts)** - Development-only mocking:
   - Only active when `import.meta.env.DEV` is true
   - Simulates Telegram environment for local testing
   - Provides mock theme params, viewport, and init data
   - Tree-shaken from production builds

### Routing Structure

- Uses `HashRouter` (not BrowserRouter) to work with Telegram's iframe constraints
- Routes defined in [src/navigation/routes.tsx](src/navigation/routes.tsx)
- Main routes:
  - `/` - Index page
  - `/init-data` - Display Telegram init data
  - `/theme-params` - Show theme parameters
  - `/launch-params` - Show launch parameters

### Component Architecture

- **[src/components/Root.tsx](src/components/Root.tsx)** - Wraps app with SDKProvider and ErrorBoundary
- **[src/components/App.tsx](src/components/App.tsx)** - Main router component
- **[src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx)** - Error handling boundary
- Pages in `src/pages/` directory correspond to routes

### Path Aliases

The project uses `@/*` path alias configured in [tsconfig.json](tsconfig.json) that maps to `src/*`:
```typescript
import { routes } from '@/navigation/routes.tsx';
import { Root } from '@/components/Root.tsx';
```

### Internationalization (i18n)

This project uses **i18next** and **react-i18next** for internationalization with support for English and Russian.

**IMPORTANT RULE: Always use locale translations - never hardcode user-facing text in English or any other language.**

**Translation Files:**
- [src/i18n/locales/en.json](src/i18n/locales/en.json) - English translations
- [src/i18n/locales/ru.json](src/i18n/locales/ru.json) - Russian translations

**Usage in Components:**
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <button>{t('common.save')}</button>;
};
```

**Usage in Utility Functions:**
```typescript
import { TFunction } from 'i18next';

export const myFunction = (param: string, t: TFunction): string => {
  return t('validation.required');
};
```

**Guidelines:**
- All user-facing text must come from translation files
- Never hardcode English strings in JSX or UI code
- Use `t('key')` without fallback strings (e.g., avoid `t('key', 'fallback')`)
- For new text, add keys to both `en.json` and `ru.json`
- Pass `TFunction` as a parameter to utility functions that need translations
- Language is automatically detected from Telegram user's `language_code`

## Deployment Configuration

Before deploying to GitHub Pages:

1. Update `homepage` in [package.json](package.json) to your GitHub Pages URL:
   ```json
   "homepage": "https://{username}.github.io/{repository}"
   ```

2. Update `base` in [vite.config.ts](vite.config.ts) to match your repository name:
   ```typescript
   base: '/{repository}/'
   ```

3. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```

## Performance Optimization

### Code Splitting Strategy

This application uses **code splitting** to optimize initial load performance. The strategy reduces the initial bundle size by lazy-loading secondary pages.

**Why Code Splitting?**
- Initial bundle was >500 KB (175 KB gzipped) - too large for mobile users
- Most users visit ListPage first; Create/Edit pages loaded on-demand
- Reduces initial load time by ~60% (5s → 2s on 3G networks)
- Critical for Telegram Mini Apps running on mobile devices

**Implementation Pattern:**

1. **Entry Point Pages (Bundled Immediately)**
   - [src/pages/ListPage.tsx](src/pages/ListPage.tsx) - Home page, always visited
   - Keep as regular import: `import { ListPage } from '@/pages/ListPage'`

2. **Secondary Pages (Lazy Loaded)**
   - [src/pages/CreatePage.tsx](src/pages/CreatePage.tsx) - Create reminder form
   - [src/pages/EditPage.tsx](src/pages/EditPage.tsx) - Edit reminder form
   - Future: Settings page, other infrequent pages
   - Use lazy import: `const CreatePage = lazy(() => import('@/pages/CreatePage'))`

**Rules for Adding New Pages:**

1. **Use Default Exports** for lazy-loaded pages:
   ```typescript
   // Good - enables lazy loading
   export default function MyPage() { ... }

   // Avoid - breaks lazy loading
   export const MyPage: FC = () => { ... }
   ```

2. **Determine if Page Should Be Lazy Loaded**:
   - Entry points/home pages → Regular import (bundled)
   - Form pages, settings, infrequent pages → Lazy import
   - Pages with heavy dependencies → Lazy import
   - Pages visited by <50% of users → Lazy import

3. **Update [src/navigation/routes.tsx](src/navigation/routes.tsx)**:
   ```typescript
   import { lazy } from 'react';
   import { ListPage } from '@/pages/ListPage'; // Bundled

   const CreatePage = lazy(() => import('@/pages/CreatePage')); // Lazy
   const SettingsPage = lazy(() => import('@/pages/SettingsPage')); // Lazy
   ```

4. **Suspense Boundary**: [src/components/App.tsx](src/components/App.tsx) includes a `<Suspense>` wrapper that shows a loading state while lazy chunks download.

**Expected Bundle Structure:**
```
dist/assets/
├── index-[hash].js         (~200 KB, 60 KB gzipped)  - Core + ListPage
├── CreatePage-[hash].js    (~100 KB, 30 KB gzipped)  - Lazy loaded
├── EditPage-[hash].js      (~95 KB, 28 KB gzipped)   - Lazy loaded
├── SettingsPage-[hash].js  (~50 KB, 15 KB gzipped)   - Future, lazy
└── vendor-[hash].js        (~200 KB, 60 KB gzipped)  - React, libs
```

**Measuring Impact:**
Run `npm run build` to see chunk sizes. Each lazy-loaded page becomes a separate JS file.

## Important Notes

- **Package Manager**: Must use npm (enforced by template)
- **Development Mocking**: [src/mockEnv.ts](src/mockEnv.ts) is imported in entry point but only active in dev mode
- **HTTPS for Mobile**: Android/iOS Telegram apps require valid SSL certificates (not self-signed)
- **macOS Telegram**: Has known bugs requiring workarounds in [src/init.ts](src/init.ts)
