# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Telegram Mini App built with React, TypeScript, and Vite. It demonstrates integration with the Telegram Mini Apps platform.

**Key Technologies:**
- React 18 with TypeScript
- [@telegram-apps/sdk-react](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react) for Telegram integration
- [@telegram-apps/telegram-ui](https://github.com/Telegram-Mini-Apps/TelegramUI) for UI components
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
- **[src/components/App.tsx](src/components/App.tsx)** - Main router component with AppRoot wrapper
- **[src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx)** - Error handling boundary
- Pages in `src/pages/` directory correspond to routes

### Path Aliases

The project uses `@/*` path alias configured in [tsconfig.json](tsconfig.json) that maps to `src/*`:
```typescript
import { routes } from '@/navigation/routes.tsx';
import { Root } from '@/components/Root.tsx';
```

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

## Important Notes

- **Package Manager**: Must use npm (enforced by template)
- **Development Mocking**: [src/mockEnv.ts](src/mockEnv.ts) is imported in entry point but only active in dev mode
- **HTTPS for Mobile**: Android/iOS Telegram apps require valid SSL certificates (not self-signed)
- **macOS Telegram**: Has known bugs requiring workarounds in [src/init.ts](src/init.ts)
