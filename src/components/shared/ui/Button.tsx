import { ReactNode } from 'react';
import { bloxat } from '@/components/fonts';

interface ButtonProps {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
}

const variantStyles = {
  primary: `
    bg-tathir-dark-green text-tathir-cream shadow-md
    hover:bg-tathir-brown transition-all duration-300
  `,
  secondary: `
    bg-white/80 text-tathir-dark-green hover:bg-white shadow-md
    hover:bg-tathir-brown transition-all duration-300
  `,
  success: `
    bg-tathir-light-green text-tathir-dark-green shadow-md
    hover:bg-tathir-cream transition-all duration-300
  `,
  warning: `
    bg-tathir-maroon text-white shadow-md
    hover:bg-tathir-brown transition-all duration-300
  `,
  error: `
    bg-tathir-error text-white shadow-md
    hover:bg-tathir-brown transition-all duration-300
  `
};

const sizeStyles = {
  sm: 'px-3 py-2 text-xs sm:text-sm',
  md: 'px-4 py-2 text-sm sm:text-base',
  lg: 'px-6 py-3 text-base sm:text-lg'
};

const disabledStyles = `
  bg-tathir-dark-green/50 text-tathir-cream/50
  cursor-not-allowed hover:bg-tathir-dark-green/50
  shadow-none opacity-75
`;

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  icon
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg font-bold transition-all duration-300
        ${bloxat.className}
        ${disabled ? disabledStyles : variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${icon ? 'flex items-center justify-center gap-2' : ''}
        active:scale-95
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
} 