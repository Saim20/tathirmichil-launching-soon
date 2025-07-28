"use client";

import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'admin' | 'student' | 'public';
  className?: string;
  fullWidth?: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'admin',
  className = "",
  fullWidth = false
}) => {
  const variantStyles = {
    admin: {
      container: 'border-tathir-brown/30',
      tab: 'text-tathir-brown hover:text-tathir-dark-green border-transparent hover:border-tathir-brown/30',
      activeTab: 'text-tathir-dark-green border-tathir-dark-green bg-tathir-dark-green/10',
      count: 'bg-tathir-brown text-tathir-cream'
    },
    student: {
      container: 'border-tathir-brown/30',
      tab: 'text-tathir-brown hover:text-tathir-dark-green border-transparent hover:border-tathir-brown/30',
      activeTab: 'text-tathir-dark-green border-tathir-dark-green bg-tathir-dark-green/10',
      count: 'bg-tathir-brown text-tathir-cream'
    },
    public: {
      container: 'border-tathir-brown/30',
      tab: 'text-tathir-brown hover:text-tathir-dark-green border-transparent hover:border-tathir-brown/30',
      activeTab: 'text-tathir-dark-green border-tathir-dark-green bg-tathir-dark-green/10',
      count: 'bg-tathir-brown text-tathir-cream'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`border-b-2 ${styles.container} ${className}`}>
      <nav className={`flex ${fullWidth ? 'w-full' : ''} overflow-x-auto`} aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled;
          
          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm
                transition-all duration-200 whitespace-nowrap
                ${fullWidth ? 'flex-1 justify-center' : ''}
                ${isActive ? styles.activeTab : styles.tab}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`
                  px-2 py-1 text-xs font-bold rounded-full min-w-[20px] text-center
                  ${styles.count}
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
