"use client";

import React from 'react';
import { bloxat } from '@/components/fonts';

interface StatBlockProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

/**
 * A component for displaying a statistic with an optional icon
 */
const StatBlock: React.FC<StatBlockProps> = ({ label, value, icon }) => (
  <div className="flex flex-col items-center justify-center bg-tathir-dark-green py-4 rounded-lg">
    {icon && <div className="mb-2">{icon}</div>}
    <p className={`text-xl font-semibold text-tathir-cream ${bloxat.className}`}>{value}</p>
    <p className="text-sm text-tathir-light-green">{label}</p>
  </div>
);

export default StatBlock;
