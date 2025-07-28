import { ReactNode } from 'react';

interface BadgeProps {
  icon?: ReactNode;
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const variantStyles = {
  success: 'bg-tathir-success/20 text-tathir-success border-tathir-success',
  warning: 'bg-tathir-warning/20 text-tathir-warning border-tathir-warning',
  error: 'bg-tathir-error/20 text-tathir-error border-tathir-error',
  info: 'bg-tathir-info/20 text-tathir-info border-tathir-info',
  default: 'bg-tathir-cream/20 text-tathir-cream border-tathir-cream'
};

const sizeStyles = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2'
};

export function Badge({ icon, label, variant = 'default', size = 'md', animate = false }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-2 rounded-lg font-medium border-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${animate ? 'animate-pulse-soft' : ''}
      `}
    >
      {icon}
      {label}
    </span>
  );
} 