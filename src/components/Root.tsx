import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'sonner';
import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { extractErrorDetails, ErrorCode } from '@/utils/errorHelpers';
import i18n from '@/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Custom retry logic based on error type
      retry: (failureCount, error) => {
        // Don't retry if we've already tried 3 times
        if (failureCount >= 3) return false;

        const details = extractErrorDetails(error);

        // Don't retry 404 errors (reminder not found)
        if (details.errorCode === ErrorCode.REMINDER_NOT_FOUND) {
          return false;
        }

        // Don't retry auth errors
        if (details.errorCode === ErrorCode.UNAUTHORIZED ||
            details.errorCode === ErrorCode.FORBIDDEN) {
          return false;
        }

        // Don't retry validation errors
        if (details.errorCode === ErrorCode.VALIDATION_ERROR) {
          return false;
        }

        // Retry network and server errors
        return details.errorCode === ErrorCode.NETWORK_ERROR ||
               details.errorCode === ErrorCode.INTERNAL_SERVER_ERROR;
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      // Consider data stale after 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      // Mutations don't retry by default
      retry: false,
    },
  },
});

function ErrorBoundaryError({ error }: { error: unknown }) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-[var(--tg-theme-destructive-text-color)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-[var(--tg-theme-text-color)] mb-2">
          Something went wrong
        </h1>

        <p className="text-[var(--tg-theme-hint-color)] mb-4">
          An unexpected error occurred. Please try reloading the app.
        </p>

        {/* Show error details in dev mode */}
        {import.meta.env.DEV && (
          <div className="mb-4 p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg text-left">
            <p className="text-xs text-[var(--tg-theme-hint-color)] font-mono break-words">
              {error instanceof Error
                ? error.message
                : typeof error === 'string'
                  ? error
                  : JSON.stringify(error)}
            </p>
            {error instanceof Error && error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-[var(--tg-theme-link-color)] cursor-pointer">
                  Stack trace
                </summary>
                <pre className="text-xs text-[var(--tg-theme-hint-color)] mt-2 overflow-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <button
          onClick={handleReload}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] rounded-lg font-medium transition-opacity active:opacity-80"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reload App
        </button>
      </div>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <App/>
          <Toaster position="top-center" />
        </I18nextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
