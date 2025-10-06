import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldErrors } from 'react-hook-form';

interface FormValidationSummaryProps {
  errors: FieldErrors;
  isVisible: boolean;
}

export const FormValidationSummary: FC<FormValidationSummaryProps> = ({ errors, isVisible }) => {
  const { t } = useTranslation();

  const flattenErrors = (errors: FieldErrors, path: string = ''): string[] => {
    const messages: string[] = [];

    Object.keys(errors).forEach((key) => {
      const error = errors[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (error?.message) {
        // Direct error message
        messages.push(typeof error.message === 'string' ? t(error.message) : String(error.message));
      } else if (Array.isArray(error)) {
        // Array of errors (like schedules)
        error.forEach((item, index) => {
          if (item && typeof item === 'object') {
            messages.push(...flattenErrors(item as FieldErrors, `${currentPath}[${index}]`));
          }
        });
      } else if (error && typeof error === 'object') {
        // Nested object errors
        messages.push(...flattenErrors(error as FieldErrors, currentPath));
      }
    });

    return messages;
  };

  const errorMessages = flattenErrors(errors);

  // Only show if we have actual error messages AND visibility is true
  if (!isVisible || errorMessages.length === 0) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2">
      <div className="flex items-start gap-2">
        <span className="text-red-500 text-lg mt-0.5">⚠️</span>
        <div className="flex-1">
          <p className="font-medium text-red-500 mb-2">{t('validation.formErrors')}</p>
          <ul className="space-y-1 text-sm text-red-400">
            {errorMessages.map((message, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
