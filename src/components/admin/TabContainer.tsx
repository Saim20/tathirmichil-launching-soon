"use client";

import React from 'react';
import { Button } from '@/components/shared/ui/Button';

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabContainerProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabContainer: React.FC<TabContainerProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) => {
  return (
    <div className={`bg-tathir-cream rounded-xl p-1 sm:p-2 mb-6 shadow-lg border-2 border-tathir-brown ${className}`}>
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            variant={activeTab === tab.id ? "primary" : "secondary"}
            size="md"
            fullWidth
            className="capitalize"
            disabled={tab.disabled}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
