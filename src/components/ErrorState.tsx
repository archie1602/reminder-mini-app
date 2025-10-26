import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, WifiOff, XCircle, ArrowLeft, RotateCw } from 'lucide-react';
import { ErrorCode, extractErrorDetails, isRecoverableError } from '@/utils/errorHelpers';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  context?: 'list' | 'edit' | 'view' | 'create';
  showBackButton?: boolean;
}

export const ErrorState: FC<ErrorStateProps> = ({
  error,
  onRetry,
  context = 'list',
  showBackButton = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const errorDetails = extractErrorDetails(error);
  const isRecoverable = isRecoverableError(error);

  // Choose appropriate icon based on error type
  const getIcon = () => {
    switch (errorDetails.errorCode) {
      case ErrorCode.NETWORK_ERROR:
        return <WifiOff className="w-12 h-12 text-[var(--tg-theme-destructive-text-color)]" />;
      case ErrorCode.REMINDER_NOT_FOUND:
        return <XCircle className="w-12 h-12 text-[var(--tg-theme-destructive-text-color)]" />;
      default:
        return <AlertCircle className="w-12 h-12 text-[var(--tg-theme-destructive-text-color)]" />;
    }
  };

  // Get appropriate error message
  const getMessage = () => {
    switch (errorDetails.errorCode) {
      case ErrorCode.REMINDER_NOT_FOUND:
        if (context === 'edit' || context === 'view') {
          return t('errors.reminderDeleted');
        }
        return t('errors.reminderNotFound');
      case ErrorCode.NETWORK_ERROR:
        return t('errors.networkErrorRetry');
      case ErrorCode.UNAUTHORIZED:
        return t('errors.unauthorized');
      case ErrorCode.FORBIDDEN:
        return t('errors.forbidden');
      case ErrorCode.INTERNAL_SERVER_ERROR:
        return t('errors.serverError');
      default:
        return errorDetails.message || t('errors.unknownError');
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="mb-4">
        {getIcon()}
      </div>

      <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)] mb-2">
        {t('common.error')}
      </h2>

      <p className="text-[var(--tg-theme-hint-color)] mb-6 max-w-sm">
        {getMessage()}
      </p>

      {/* Show error details in dev mode */}
      {import.meta.env.DEV && errorDetails.status && (
        <div className="mb-4 p-2 bg-[var(--tg-theme-secondary-bg-color)] rounded text-xs text-[var(--tg-theme-hint-color)]">
          Status: {errorDetails.status} | Code: {errorDetails.errorCode}
        </div>
      )}

      <div className="flex gap-3">
        {/* Back button for 404 or when specified */}
        {showBackButton && (errorDetails.errorCode === ErrorCode.REMINDER_NOT_FOUND || context !== 'list') && (
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] rounded-lg font-medium transition-opacity active:opacity-80"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('errors.goBack')}
          </button>
        )}

        {/* Retry button for recoverable errors */}
        {isRecoverable && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] rounded-lg font-medium transition-opacity active:opacity-80"
          >
            <RotateCw className="w-4 h-4" />
            {t('errors.tryAgain')}
          </button>
        )}
      </div>
    </div>
  );
};