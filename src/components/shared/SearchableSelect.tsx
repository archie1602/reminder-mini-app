import { FC, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Check } from 'lucide-react';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  value: string | number;
  options: SearchableSelectOption[];
  onChange: (value: string | number) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export const SearchableSelect: FC<SearchableSelectProps> = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  error,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Get the label for the currently selected value
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder || t('common.select');

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal
  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
    }
  };

  // Close modal
  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  // Select an option
  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    handleClose();
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll selected item into view when modal opens
  useEffect(() => {
    if (isOpen && listRef.current && selectedOption) {
      const selectedElement = listRef.current.querySelector(`[data-value="${selectedOption.value}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [isOpen, selectedOption]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--tg-theme-text-color)] mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg border bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] border-[var(--tg-theme-hint-color)] focus:outline-none focus:border-[var(--tg-theme-button-color)] text-left flex items-center justify-between ${
          error ? 'border-red-500' : ''
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={!selectedOption ? 'text-[var(--tg-theme-hint-color)]' : ''}>
          {displayValue}
        </span>
        <span className="ml-2">▼</span>
      </button>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="relative bg-[var(--tg-theme-bg-color)] rounded-lg shadow-xl m-4 w-full max-w-md flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--tg-theme-hint-color)]/20">
              <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
                {label || t('common.select')}
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--tg-theme-hint-color)]/10 transition-colors"
                aria-label={t('common.close')}
              >
                <span className="text-xl text-[var(--tg-theme-text-color)]">×</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-[var(--tg-theme-hint-color)]/20">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.search')}
                  className="w-full px-3 py-2 pl-9 rounded-lg border bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] border-[var(--tg-theme-hint-color)] focus:outline-none focus:border-[var(--tg-theme-button-color)]"
                />
                {/* Search Icon */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tg-theme-hint-color)]">
                  <Search size={16} />
                </span>
                {/* Clear Button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--tg-theme-hint-color)]/10"
                  >
                    <span className="text-[var(--tg-theme-hint-color)]">×</span>
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-2"
              style={{ maxHeight: 'calc(80vh - 160px)' }}
            >
              {filteredOptions.length === 0 ? (
                <div className="text-center py-8 text-[var(--tg-theme-hint-color)]">
                  {t('common.noResults')}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredOptions.map((option) => {
                    const isSelected = option.value === value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        data-value={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]'
                            : 'hover:bg-[var(--tg-theme-hint-color)]/10 text-[var(--tg-theme-text-color)]'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check size={16} className="ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
