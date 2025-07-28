"use client";

import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

type SearchBarVariant = 'admin' | 'student' | 'public';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  variant?: SearchBarVariant;
  className?: string;
  showSearchButton?: boolean;
  clearable?: boolean;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  variant = 'admin',
  className = "",
  showSearchButton = false,
  clearable = true,
  loading = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const variantStyles = {
    admin: {
      container: 'bg-white border-tathir-brown focus-within:border-tathir-dark-green',
      input: 'text-tathir-dark-green placeholder-tathir-brown/60',
      icon: 'text-tathir-brown/60',
      button: 'bg-tathir-dark-green hover:bg-tathir-brown text-tathir-cream'
    },
    student: {
      container: 'bg-white border-tathir-brown focus-within:border-tathir-dark-green',
      input: 'text-tathir-dark-green placeholder-tathir-brown/60',
      icon: 'text-tathir-brown/60',
      button: 'bg-tathir-dark-green hover:bg-tathir-brown text-tathir-cream'
    },
    public: {
      container: 'bg-white border-tathir-brown focus-within:border-tathir-dark-green',
      input: 'text-tathir-dark-green placeholder-tathir-brown/60',
      icon: 'text-tathir-brown/60',
      button: 'bg-tathir-dark-green hover:bg-tathir-brown text-tathir-cream'
    }
  };

  const styles = variantStyles[variant];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    onChange('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={`
        relative flex items-center
        border-2 rounded-lg transition-all duration-300
        ${styles.container}
        ${isFocused ? 'ring-2 ring-opacity-50' : ''}
      `}>
        <div className={`absolute left-3 ${styles.icon}`}>
          {loading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaSearch className="w-4 h-4" />
          )}
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full py-3 pl-10 pr-10 bg-transparent focus:outline-none
            ${styles.input}
            ${showSearchButton ? 'rounded-l-lg' : 'rounded-lg'}
          `}
        />

        {clearable && value && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-3 p-1 rounded-full hover:bg-black/10 transition-colors ${styles.icon}`}
          >
            <FaTimes className="w-3 h-3" />
          </button>
        )}

        {showSearchButton && (
          <button
            type="submit"
            disabled={loading}
            className={`
              px-4 py-3 rounded-r-lg border-l-2 border-current
              transition-all duration-300 disabled:opacity-50
              ${styles.button}
            `}
          >
            Search
          </button>
        )}
      </div>
    </form>
  );
};
