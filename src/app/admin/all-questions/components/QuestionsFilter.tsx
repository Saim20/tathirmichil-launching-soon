"use client";

import React from 'react';
import { FaSearch, FaFilter, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa';

interface QuestionsFilterProps {
    searchTerm: string;
    selectedCategory: string;
    selectedSubCategory: string;
    sortBy: 'title' | 'category' | 'subCategory';
    sortOrder: 'asc' | 'desc';
    categories: string[];
    subCategories: string[];
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSubCategoryChange: (value: string) => void;
    onSortChange: (field: 'title' | 'category' | 'subCategory') => void;
}

const QuestionsFilter: React.FC<QuestionsFilterProps> = ({
    searchTerm,
    selectedCategory,
    selectedSubCategory,
    sortBy,
    sortOrder,
    categories,
    subCategories,
    onSearchChange,
    onCategoryChange,
    onSubCategoryChange,
    onSortChange
}) => {
    const getSortIcon = (field: 'title' | 'category' | 'subCategory') => {
        if (sortBy !== field) return null;
        return sortOrder === 'asc' ? <FaSortAlphaDown className="ml-1" /> : <FaSortAlphaUp className="ml-1" />;
    };

    return (
        <div className="bg-tathir-cream rounded-xl p-6 mb-8 shadow-lg border-2 border-tathir-brown">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tathir-maroon/50" />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-tathir-brown rounded-lg 
                                 focus:border-tathir-dark-green focus:outline-none 
                                 placeholder-tathir-maroon/50"
                    />
                </div>

                {/* Category Filter */}
                <div className="relative">
                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tathir-maroon/50" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-tathir-brown rounded-lg 
                                 focus:border-tathir-dark-green focus:outline-none appearance-none 
                                 bg-white cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sub Category Filter */}
                <div className="relative">
                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tathir-maroon/50" />
                    <select
                        value={selectedSubCategory}
                        onChange={(e) => onSubCategoryChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-tathir-brown rounded-lg 
                                 focus:border-tathir-dark-green focus:outline-none appearance-none 
                                 bg-white cursor-pointer"
                    >
                        <option value="">All Sub Categories</option>
                        {subCategories.map(subCategory => (
                            <option key={subCategory} value={subCategory}>
                                {subCategory}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort by Title */}
                <button
                    onClick={() => onSortChange('title')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-tathir-light-green 
                             text-tathir-dark-green font-bold rounded-lg hover:bg-tathir-dark-green 
                             hover:text-tathir-cream transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    Title
                    {getSortIcon('title')}
                </button>

                {/* Sort by Category */}
                <button
                    onClick={() => onSortChange('category')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-tathir-light-green 
                             text-tathir-dark-green font-bold rounded-lg hover:bg-tathir-dark-green 
                             hover:text-tathir-cream transition-all duration-300 shadow-md hover:shadow-lg"
                >
                    Category
                    {getSortIcon('category')}
                </button>
            </div>
        </div>
    );
};

export default QuestionsFilter;
