import { AxiosError } from 'axios';
import { TFunction } from 'i18next';

// API error response type based on your backend
export interface ApiErrorResponse {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  errorCode?: string;
  instance?: string;
  requestId?: string;
  traceId?: string;
  errors?: Record<string, string[]>; // For validation errors
}

// Error codes from your API
export enum ErrorCode {
  REMINDER_NOT_FOUND = 'REMINDER_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Helper to extract error details from axios errors
export function extractErrorDetails(error: unknown): {
  status: number | null;
  errorCode: ErrorCode;
  message: string;
  validationErrors?: Record<string, string[]>;
} {
  if (error instanceof AxiosError) {
    const response = error.response;

    // Network error (no response)
    if (!response) {
      return {
        status: null,
        errorCode: ErrorCode.NETWORK_ERROR,
        message: error.message || 'Network error',
      };
    }

    const data = response.data as ApiErrorResponse | undefined;

    // Map status codes and error codes
    const errorCode = data?.errorCode || mapStatusToErrorCode(response.status);

    return {
      status: response.status,
      errorCode: errorCode as ErrorCode,
      message: data?.detail || data?.title || error.message,
      validationErrors: data?.errors,
    };
  }

  // Non-axios error
  return {
    status: null,
    errorCode: ErrorCode.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

// Map HTTP status codes to error codes
function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.REMINDER_NOT_FOUND;
    case 500:
    case 502:
    case 503:
      return ErrorCode.INTERNAL_SERVER_ERROR;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
}

// Get user-friendly error message based on error code
export function getErrorMessage(errorCode: ErrorCode, t: TFunction): string {
  switch (errorCode) {
    case ErrorCode.REMINDER_NOT_FOUND:
      return t('errors.reminderNotFound');
    case ErrorCode.VALIDATION_ERROR:
      return t('errors.validationError');
    case ErrorCode.UNAUTHORIZED:
      return t('errors.unauthorized');
    case ErrorCode.FORBIDDEN:
      return t('errors.forbidden');
    case ErrorCode.INTERNAL_SERVER_ERROR:
      return t('errors.serverError');
    case ErrorCode.NETWORK_ERROR:
      return t('errors.networkError');
    case ErrorCode.UNKNOWN_ERROR:
    default:
      return t('errors.unknownError');
  }
}

// Get context-specific error message for mutations
export function getMutationErrorMessage(
  error: unknown,
  operation: 'create' | 'update' | 'delete' | 'pause' | 'activate' | 'draft',
  t: TFunction
): string {
  const details = extractErrorDetails(error);

  // Special handling for 404 in update/delete operations
  if (details.errorCode === ErrorCode.REMINDER_NOT_FOUND) {
    switch (operation) {
      case 'update':
        return t('errors.reminderDeletedCannotUpdate');
      case 'delete':
        return t('errors.reminderAlreadyDeleted');
      case 'pause':
      case 'activate':
      case 'draft':
        return t('errors.reminderDeletedCannotModify');
      default:
        return t('errors.reminderNotFound');
    }
  }

  // Network errors
  if (details.errorCode === ErrorCode.NETWORK_ERROR) {
    return t('errors.networkErrorRetry');
  }

  // Validation errors with details
  if (details.errorCode === ErrorCode.VALIDATION_ERROR && details.validationErrors) {
    const firstError = Object.values(details.validationErrors)[0]?.[0];
    if (firstError) {
      return firstError;
    }
  }

  // Default to generic message based on operation
  switch (operation) {
    case 'create':
      return t('errors.createFailed');
    case 'update':
      return t('errors.updateFailed');
    case 'delete':
      return t('errors.deleteFailed');
    case 'pause':
      return t('errors.pauseFailed');
    case 'activate':
      return t('errors.activateFailed');
    case 'draft':
      return t('errors.draftFailed');
    default:
      return getErrorMessage(details.errorCode, t);
  }
}

// Check if error is recoverable (should show retry)
export function isRecoverableError(error: unknown): boolean {
  const details = extractErrorDetails(error);

  // Network errors and server errors are recoverable
  return details.errorCode === ErrorCode.NETWORK_ERROR ||
         details.errorCode === ErrorCode.INTERNAL_SERVER_ERROR ||
         details.status === null; // No response means network issue
}

// Check if should navigate away (e.g., 404 on edit page)
export function shouldNavigateOnError(error: unknown, context: 'edit' | 'view'): boolean {
  const details = extractErrorDetails(error);

  // Navigate away from edit/view if reminder not found
  return details.errorCode === ErrorCode.REMINDER_NOT_FOUND &&
         (context === 'edit' || context === 'view');
}