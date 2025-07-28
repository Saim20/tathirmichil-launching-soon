"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck, FaSearch, FaTimes } from 'react-icons/fa';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  variant?: 'admin' | 'student' | 'public';
  className?: string;
  maxHeight?: string;
  clearable?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  multiple = false,
  disabled = false,
  variant = 'admin',
  className = "",
  maxHeight = "200px",
  clearable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const variantStyles = {
    admin: {
      trigger: 'bg-tathir-cream/10 border-tathir-maroon text-tathir-cream focus:border-tathir-light-green',
      dropdown: 'bg-tathir-dark-green border-tathir-maroon shadow-xl',
      option: 'text-tathir-cream hover:bg-tathir-light-green/20',
      selectedOption: 'bg-tathir-light-green/30 text-tathir-cream',
      searchInput: 'bg-tathir-cream/10 border-tathir-maroon text-tathir-cream placeholder-tathir-cream/60',
      icon: 'text-tathir-cream/60'
    },
    student: {
      trigger: 'bg-tathir-cream/10 border-tathir-maroon text-tathir-cream focus:border-tathir-light-green',
      dropdown: 'bg-tathir-dark-green border-tathir-maroon shadow-xl',
      option: 'text-tathir-cream hover:bg-tathir-light-green/20',
      selectedOption: 'bg-tathir-light-green/30 text-tathir-cream',
      searchInput: 'bg-tathir-cream/10 border-tathir-maroon text-tathir-cream placeholder-tathir-cream/60',
      icon: 'text-tathir-cream/60'
    },
    public: {
      trigger: 'bg-white border-tathir-brown text-tathir-dark-green focus:border-tathir-dark-green',
      dropdown: 'bg-white border-tathir-brown shadow-xl',
      option: 'text-tathir-dark-green hover:bg-tathir-dark-green/10',
      selectedOption: 'bg-tathir-dark-green/20 text-tathir-dark-green',
      searchInput: 'bg-white border-tathir-brown text-tathir-dark-green placeholder-tathir-brown/60',
      icon: 'text-tathir-brown/60'
    }
  };

  const styles = variantStyles[variant];

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected options for display
  const selectedOptions = multiple && Array.isArray(value)
    ? options.filter(option => value.includes(option.value))
    : options.filter(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleOptionClick = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  const isSelected = (optionValue: string) => {
    return multiple && Array.isArray(value)
      ? value.includes(optionValue)
      : value === optionValue;
  };

  const getDisplayText = () => {
    if (selectedOptions.length === 0) return placeholder;
    if (multiple) {
      return selectedOptions.length === 1 
        ? selectedOptions[0].label
        : `${selectedOptions.length} items selected`;
    }
    return selectedOptions[0]?.label || placeholder;
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg border-2 transition-all duration-300
          flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-opacity-50
          ${styles.trigger}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="truncate">{getDisplayText()}</span>
        <div className="flex items-center gap-2 ml-2">
          {clearable && selectedOptions.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className={`p-1 rounded hover:bg-black/10 transition-colors ${styles.icon}`}
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
          <FaChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${styles.icon} ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className={`
            absolute top-full left-0 right-0 mt-1 z-50
            ${styles.dropdown} rounded-lg border-2 overflow-hidden
          `}
          style={{ maxHeight }}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-current/20">
              <div className="relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${styles.icon}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className={`
                    w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-opacity-50
                    ${styles.searchInput}
                  `}
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="overflow-y-auto" style={{ maxHeight: searchable ? '150px' : maxHeight }}>
            {filteredOptions.length === 0 ? (
              <div className={`p-3 text-center ${styles.option} opacity-60`}>
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const selected = isSelected(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleOptionClick(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full px-4 py-3 text-left transition-colors duration-200
                      flex items-center justify-between
                      ${selected ? styles.selectedOption : styles.option}
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                    {selected && <FaCheck className="w-4 h-4" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
