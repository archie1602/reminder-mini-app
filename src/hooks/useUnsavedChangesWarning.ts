import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface UseUnsavedChangesWarningProps {
  hasUnsavedChanges: boolean;
  onBackClick: () => void;
}

export const useUnsavedChangesWarning = ({
  hasUnsavedChanges,
  onBackClick,
}: UseUnsavedChangesWarningProps) => {
  const { t } = useTranslation();

  // Return a wrapped callback that shows confirmation before navigating
  const handleBackWithConfirmation = useCallback(() => {
    if (hasUnsavedChanges) {
      // Show native confirm dialog
      const confirmed = window.confirm(t('modal.unsavedChangesMessage'));
      if (confirmed) {
        onBackClick();
      }
      // If not confirmed, do nothing (stay on page)
    } else {
      onBackClick();
    }
  }, [hasUnsavedChanges, onBackClick, t]);

  return handleBackWithConfirmation;
};
