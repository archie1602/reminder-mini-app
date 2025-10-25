import { useState, useEffect } from 'react';
import { ReminderSortBy, SortOrder } from '@/api/types';

const STORAGE_KEY = 'reminder-sort-settings';

export interface SortSettings {
  sortBy: ReminderSortBy;
  order: SortOrder;
}

const DEFAULT_SORT_SETTINGS: SortSettings = {
  sortBy: ReminderSortBy.CreatedAt,
  order: SortOrder.Desc,
};

const loadSortSettings = (): SortSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the parsed data
      if (
        parsed.sortBy &&
        Object.values(ReminderSortBy).includes(parsed.sortBy) &&
        parsed.order &&
        Object.values(SortOrder).includes(parsed.order)
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load sort settings from localStorage:', error);
  }
  return DEFAULT_SORT_SETTINGS;
};

const saveSortSettings = (settings: SortSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save sort settings to localStorage:', error);
  }
};

export const useSortSettings = () => {
  const [settings, setSettings] = useState<SortSettings>(loadSortSettings);

  useEffect(() => {
    saveSortSettings(settings);
  }, [settings]);

  const setSortBy = (sortBy: ReminderSortBy) => {
    setSettings((prev) => ({ ...prev, sortBy }));
  };

  const setOrder = (order: SortOrder) => {
    setSettings((prev) => ({ ...prev, order }));
  };

  const resetSort = () => {
    setSettings(DEFAULT_SORT_SETTINGS);
  };

  const updateSettings = (newSettings: Partial<SortSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    sortBy: settings.sortBy,
    order: settings.order,
    setSortBy,
    setOrder,
    resetSort,
    updateSettings,
  };
};
