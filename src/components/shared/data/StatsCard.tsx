"use client";

import React from 'react';
import { bloxat } from '@/components/fonts';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'admin' | 'student' | 'public';
  className?: string;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'admin',
  className = "",
  loading = false
}) => {
  const variantStyles = {
    admin: {
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      title: 'text-tathir-brown',
      value: 'text-tathir-dark-green',
      subtitle: 'text-tathir-brown/70',
      icon: 'text-tathir-dark-green',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600'
    },
    student: {
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      title: 'text-tathir-brown',
      value: 'text-tathir-dark-green',
      subtitle: 'text-tathir-brown/70',
      icon: 'text-tathir-dark-green',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600'
    },
    public: {
      container: 'bg-tathir-cream border-tathir-brown text-tathir-dark-green',
      title: 'text-tathir-brown',
      value: 'text-tathir-dark-green',
      subtitle: 'text-tathir-brown/70',
      icon: 'text-tathir-dark-green',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600'
    }
  };

  const styles = variantStyles[variant];

  if (loading) {
    return (
      <div className={`${styles.container} rounded-xl border-2 sm:border-4 p-4 sm:p-6 shadow-xl ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-current opacity-20 rounded w-24"></div>
            <div className="h-8 w-8 bg-current opacity-20 rounded"></div>
          </div>
          <div className="h-8 bg-current opacity-20 rounded w-16 mb-2"></div>
          <div className="h-3 bg-current opacity-20 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} rounded-xl border-2 sm:border-4 p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-medium ${styles.title}`}>
          {title}
        </h3>
        {icon && (
          <div className={`text-2xl ${styles.icon}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mb-2">
        <p className={`text-2xl sm:text-3xl font-bold ${styles.value} ${bloxat.className}`}>
          {value}
        </p>
      </div>

      <div className="flex items-center justify-between">
        {subtitle && (
          <p className={`text-xs ${styles.subtitle}`}>
            {subtitle}
          </p>
        )}
        
        {trend && (
          <div className={`text-xs font-medium flex items-center gap-1 ${
            trend.isPositive ? styles.trendPositive : styles.trendNegative
          }`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
            {trend.label && <span>{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
