import { useState } from "react";
import { TEST_CATEGORIES, CATEGORY_COLORS, CATEGORY_DISPLAY_NAMES } from "@/lib/constants/categories";
import { FiFilter, FiX } from "react-icons/fi";

interface CategoryFilterProps {
  selectedCategory?: string;
  onCategoryChange: (category?: string) => void;
  className?: string;
}

export function CategoryFilter({ selectedCategory, onCategoryChange, className = "" }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategorySelect = (category?: string) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          selectedCategory 
            ? 'bg-tathir-dark-green text-white border-tathir-dark-green' 
            : 'bg-white text-tathir-brown border-gray-300 hover:border-tathir-green'
        }`}
      >
        <FiFilter size={16} />
        <span className="text-sm font-medium">
          {selectedCategory ? CATEGORY_DISPLAY_NAMES[selectedCategory] || selectedCategory : 'All Categories'}
        </span>
        {selectedCategory && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCategorySelect();
            }}
            className="ml-2 hover:bg-white/20 rounded-full p-1"
          >
            <FiX size={14} />
          </button>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2">
            {/* All Categories Option */}
            <button
              onClick={() => handleCategorySelect()}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                !selectedCategory 
                  ? 'bg-tathir-light-green text-tathir-dark-green font-medium' 
                  : 'text-tathir-brown hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            
            {/* Divider */}
            <div className="border-t border-gray-100 my-1" />
            
            {/* Category Options */}
            {TEST_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                  selectedCategory === category 
                    ? 'bg-tathir-light-green text-tathir-dark-green font-medium' 
                    : 'text-tathir-brown hover:bg-gray-50'
                }`}
              >
                <span>{CATEGORY_DISPLAY_NAMES[category] || category}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs border ${
                    CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {category}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
