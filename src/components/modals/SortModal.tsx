import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReminderSortBy, SortOrder } from '@/api/types';
import { Select } from '@/components/shared/Select';
import { Button } from '@/components/shared/Button';

interface SortModalProps {
  isOpen: boolean;
  currentSortBy: ReminderSortBy;
  currentOrder: SortOrder;
  onApply: (sortBy: ReminderSortBy, order: SortOrder) => void;
  onClose: () => void;
}

export const SortModal: React.FC<SortModalProps> = ({
  isOpen,
  currentSortBy,
  currentOrder,
  onApply,
  onClose,
}) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<ReminderSortBy>(currentSortBy);
  const [order, setOrder] = useState<SortOrder>(currentOrder);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(sortBy, order);
    onClose();
  };

  const sortByOptions = [
    { value: ReminderSortBy.CreatedAt, label: t('sort.createdAt') },
    { value: ReminderSortBy.ChangedAt, label: t('sort.changedAt') },
  ];

  const orderOptions = [
    { value: SortOrder.Desc, label: t('sort.desc') },
    { value: SortOrder.Asc, label: t('sort.asc') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--tg-theme-bg-color)] rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
        {/* Header */}
        <div className="flex items-start mb-6">
          <h2 className="text-xl font-semibold text-[var(--tg-theme-text-color)]">
            {t('sort.title')}
          </h2>
        </div>

        {/* Sort Options */}
        <div className="space-y-4 mb-6">
          <Select
            label={t('sort.sortBy')}
            options={sortByOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ReminderSortBy)}
          />

          <Select
            label={t('sort.order')}
            options={orderOptions}
            value={order}
            onChange={(e) => setOrder(e.target.value as SortOrder)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button onClick={onClose} variant="secondary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleApply} variant="primary">
            {t('sort.apply')}
          </Button>
        </div>
      </div>
    </div>
  );
};
