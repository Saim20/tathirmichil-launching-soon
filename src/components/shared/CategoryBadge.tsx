import { CATEGORY_COLORS, CATEGORY_DISPLAY_NAMES } from "@/lib/constants/categories";

interface CategoryBadgeProps {
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryBadge({ category, size = 'sm', className = "" }: CategoryBadgeProps) {
  if (!category) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const colorClasses = CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      {CATEGORY_DISPLAY_NAMES[category] || category}
    </span>
  );
}
