import React from 'react';
import { AlertTriangle, Eye } from 'lucide-react';

interface TabSwitchDisplayProps {
  tabSwitchCount: number;
  style?: {
    container?: string;
    icon?: string;
    count?: string;
    label?: string;
  };
}

export default function TabSwitchDisplay({ 
  tabSwitchCount, 
  style = {} 
}: TabSwitchDisplayProps) {
  const getTabSwitchColor = (count: number) => {
    if (count === 0) return 'text-green-500';
    if (count <= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTabSwitchMessage = (count: number) => {
    if (count === 0) return 'No tab switches detected';
    if (count === 1) return '1 tab switch detected';
    return `${count} tab switches detected`;
  };

  const getTabSwitchIcon = (count: number) => {
    if (count === 0) return <Eye className={style.icon || "text-xl"} />;
    return <AlertTriangle className={style.icon || "text-xl"} />;
  };

  return (
    <div className={style.container || "flex items-center gap-3 p-4 bg-gray-50 rounded-lg border"}>
      <div className={getTabSwitchColor(tabSwitchCount)}>
        {getTabSwitchIcon(tabSwitchCount)}
      </div>
      <div>
        <div className={style.count || `text-lg font-bold ${getTabSwitchColor(tabSwitchCount)}`}>
          {tabSwitchCount}
        </div>
        <div className={style.label || "text-sm text-gray-600"}>
          {getTabSwitchMessage(tabSwitchCount)}
        </div>
      </div>
    </div>
  );
}
