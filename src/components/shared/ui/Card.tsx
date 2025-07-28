import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'dark';
  hover?: boolean;
  active?: boolean;
}

const variantStyles = {
  default: 'bg-tathir-dark-green border-tathir-maroon',
  glass: 'tathir-glass border-tathir-cream',
  dark: 'bg-tathir-maroon border-tathir-dark-green'
};

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  active = true
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl border-4 p-6
        ${variantStyles[variant]}
        ${hover ? 'tathir-card-hover' : ''}
        ${active ? 'tathir-card-active' : ''}
        ${className}
      `}
      style={{ imageRendering: 'pixelated' }}
    >
      {children}
    </div>
  );
} 