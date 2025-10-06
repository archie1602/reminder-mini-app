import { FieldErrors } from 'react-hook-form';

/**
 * Recursively checks if there are any actual validation errors in the form errors object
 * @param errors - The errors object from react-hook-form
 * @returns true if there are any error messages, false otherwise
 */
export const hasValidationErrors = (errors: FieldErrors): boolean => {
  if (!errors || typeof errors !== 'object') {
    return false;
  }

  return Object.keys(errors).some((key) => {
    const error = errors[key];

    // Direct error message
    if (error?.message) {
      return true;
    }

    // Array of errors (like schedules)
    if (Array.isArray(error)) {
      return error.some((item) => {
        if (item && typeof item === 'object') {
          return hasValidationErrors(item as FieldErrors);
        }
        return false;
      });
    }

    // Nested object errors
    if (error && typeof error === 'object') {
      return hasValidationErrors(error as FieldErrors);
    }

    return false;
  });
};
