"use client";

import React, { useState } from 'react';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { bloxat } from '@/components/fonts';
import { Button } from '../ui/Button';
import { FormField, FormSelect } from '../forms/FormComponents';
import { SearchBar } from '../forms/SearchBar';

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'search' | 'date' | 'range';
  options?: { value: string; label: string }[];
  placeholder?: string;
  value?: any;
}

interface FilterPanelProps {
  filters: FilterOption[];
  onFiltersChange: (filters: { [key: string]: any }) => void;
  onClear: () => void;
  variant?: 'admin' | 'student' | 'public';
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  showActiveCount?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClear,
  variant = 'admin',
  className = "",
  collapsible = true,
  defaultCollapsed = false,
  showActiveCount = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [filterValues, setFilterValues] = useState<{ [key: string]: any }>(() => {
    const initial: { [key: string]: any } = {};
    filters.forEach(filter => {
      initial[filter.key] = filter.value || '';
    });
    return initial;
  });

  const variantStyles = {
    admin: {
      container: 'bg-tathir-dark-green border-tathir-maroon text-tathir-cream',
      header: 'text-tathir-cream border-tathir-maroon/30',
      activeCount: 'bg-tathir-light-green text-tathir-dark-green',
      clearButton: 'text-tathir-light-green hover:text-tathir-cream'
    },
    student: {
      container: 'bg-tathir-dark-green border-tathir-maroon text-tathir-cream',
      header: 'text-tathir-cream border-tathir-maroon/30',
      activeCount: 'bg-tathir-light-green text-tathir-dark-green',
      clearButton: 'text-tathir-light-green hover:text-tathir-cream'
    },
    public: {
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      header: 'text-tathir-dark-green border-tathir-brown/30',
      activeCount: 'bg-tathir-dark-green text-tathir-cream',
      clearButton: 'text-tathir-brown hover:text-tathir-dark-green'
    }
  };

  const styles = variantStyles[variant];

  // Count active filters
  const activeFilterCount = Object.values(filterValues).filter(value => 
    value && value !== '' && (!Array.isArray(value) || value.length > 0)
  ).length;

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters: { [key: string]: any } = {};
    filters.forEach(filter => {
      clearedFilters[filter.key] = '';
    });
    setFilterValues(clearedFilters);
    onClear();
  };

  const renderFilter = (filter: FilterOption) => {
    const value = filterValues[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <FormSelect
            id={filter.key}
            label={filter.label}
            value={value || ''}
            onChange={(newValue) => handleFilterChange(filter.key, newValue)}
            options={filter.options || []}
            variant={variant}
            placeholder={filter.placeholder}
          />
        );

      case 'search':
        return (
          <div className="mb-4">
            <label className={`block text-sm font-bold mb-2 text-current ${bloxat.className}`}>
              {filter.label}
            </label>
            <SearchBar
              value={value || ''}
              onChange={(newValue) => handleFilterChange(filter.key, newValue)}
              placeholder={filter.placeholder}
              variant={variant}
              clearable={true}
            />
          </div>
        );

      case 'date':
        return (
          <FormField
            id={filter.key}
            label={filter.label}
            type="date"
            value={value || ''}
            onChange={(newValue) => handleFilterChange(filter.key, newValue)}
            variant={variant}
            placeholder={filter.placeholder}
          />
        );

      case 'range':
        return (
          <div className="mb-4">
            <label className={`block text-sm font-bold mb-2 text-current ${bloxat.className}`}>
              {filter.label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <FormField
                id={`${filter.key}_min`}
                label=""
                type="number"
                value={value?.min || ''}
                onChange={(newValue) => handleFilterChange(filter.key, { ...value, min: newValue })}
                variant={variant}
                placeholder="Min"
              />
              <FormField
                id={`${filter.key}_max`}
                label=""
                type="number"
                value={value?.max || ''}
                onChange={(newValue) => handleFilterChange(filter.key, { ...value, max: newValue })}
                variant={variant}
                placeholder="Max"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${styles.container} rounded-xl border-2 sm:border-4 shadow-xl ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 ${!isCollapsed ? 'border-b-2 ' + styles.header : ''}`}>
        <div className="flex items-center gap-3">
          <FaFilter className="w-4 h-4" />
          <h3 className={`font-bold ${bloxat.className}`}>Filters</h3>
          {showActiveCount && activeFilterCount > 0 && (
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles.activeCount}`}>
              {activeFilterCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleClear}
              className={`text-sm font-medium transition-colors duration-200 ${styles.clearButton}`}
            >
              Clear All
            </button>
          )}
          
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-black/10 transition-colors"
            >
              {isCollapsed ? (
                <FaChevronDown className="w-4 h-4" />
              ) : (
                <FaChevronUp className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                {renderFilter(filter)}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          {activeFilterCount > 0 && (
            <div className="flex gap-3 pt-4 border-t border-current/20 mt-4">
              <Button
                variant="secondary"
                onClick={handleClear}
                size="sm"
                icon={<FaTimes className="w-3 h-3" />}
              >
                Clear Filters
              </Button>
              <Button
                variant="primary"
                onClick={() => onFiltersChange(filterValues)}
                size="sm"
                icon={<FaFilter className="w-3 h-3" />}
              >
                Apply Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
