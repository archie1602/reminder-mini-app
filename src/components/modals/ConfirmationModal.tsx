import React from 'react';
import { useTranslation } from 'react-i18next';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'warning' | 'danger' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = 'warning',
}) => {
  const { t } = useTranslation();

  // Use translations as defaults if not provided
  const finalConfirmText = confirmText || t('modal.defaultConfirm');
  const finalCancelText = cancelText || t('modal.defaultCancel');
  if (!isOpen) return null;

  const variantStyles = {
    warning: {
      icon: '⚠️',
      confirmBtn: 'bg-yellow-500 hover:bg-yellow-600',
    },
    danger: {
      icon: '❌',
      confirmBtn: 'bg-red-500 hover:bg-red-600',
    },
    info: {
      icon: 'ℹ️',
      confirmBtn: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-start mb-4">
          <span className="text-2xl mr-3">{styles.icon}</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>

        {/* Message */}
        <div className="mb-6 text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {message}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {finalCancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${styles.confirmBtn}`}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};