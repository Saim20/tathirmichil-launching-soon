"use client";

import React, { useState } from 'react';
import { useQuestions } from '@/hooks/useQuestions';
import NormalQuestionsTab from './components/NormalQuestionsTab';
import ComprehensiveQuestionsTab from './components/ComprehensiveQuestionsTab';
import QuestionsFilter from './components/QuestionsFilter';
import { 
    FaQuestionCircle,
    FaLayerGroup,
    FaSpinner
} from 'react-icons/fa';
import { bloxat } from '@/components/fonts';

const AllQuestionsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'normal' | 'comprehensive'>('normal');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [sortBy, setSortBy] = useState<'title' | 'category' | 'subCategory'>('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const {
        filteredQuestions,
        filteredComprehensiveQuestions,
        loading,
        refreshQuestions,
        totalCount,
        comprehensiveTotalCount,
        categories,
        subCategories
    } = useQuestions({
        searchTerm,
        category: selectedCategory,
        subCategory: selectedSubCategory,
        sortBy,
        sortOrder,
        includeComprehensive: true
    });

    const handleRefresh = async () => {
        await refreshQuestions();
    };

    if (loading && filteredQuestions.length === 0 && filteredComprehensiveQuestions.length === 0) {
        return (
            <div className="min-h-screen bg-tathir-beige relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-[35rem] h-[35rem] bg-tathir-maroon/10 rounded-full blur-3xl -top-24 -right-24 animate-pulse"></div>
                    <div className="absolute w-[25rem] h-[25rem] bg-tathir-brown/10 rounded-full blur-3xl bottom-0 left-0 animate-pulse delay-1000"></div>
                </div>

                <div className="flex items-center justify-center min-h-screen relative z-10">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-6xl text-tathir-dark-green mb-4 mx-auto" />
                        <p className="text-2xl text-tathir-maroon font-semibold">Loading Questions...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-tathir-beige relative overflow-hidden pb-8">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-[35rem] h-[35rem] bg-tathir-maroon/10 rounded-full blur-3xl -top-24 -right-24 animate-pulse"></div>
                <div className="absolute w-[25rem] h-[25rem] bg-tathir-brown/10 rounded-full blur-3xl bottom-0 left-0 animate-pulse delay-1000"></div>
                <div className="absolute w-[20rem] h-[20rem] bg-tathir-dark-green/10 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse delay-500"></div>
            </div>

            <div className="max-w-7xl mx-auto px-2 sm:px-4 relative z-10">
                {/* Header */}
                <div className="bg-tathir-dark-green rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl border-2 sm:border-4 border-tathir-maroon">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-tathir-cream mb-2 ${bloxat.className}`}>
                                All Questions
                            </h1>
                            <p className="text-tathir-light-green text-sm sm:text-base lg:text-lg">
                                Manage and search through all questions in the database
                            </p>
                            <div className="flex items-center gap-2 sm:gap-4 mt-2 text-tathir-cream">
                                <span className="text-xs sm:text-sm">
                                    Normal: <span className="font-bold">{totalCount}</span>
                                </span>
                                <span className="text-xs sm:text-sm">
                                    Comprehensive: <span className="font-bold">{comprehensiveTotalCount}</span>
                                </span>
                                <span className="text-xs sm:text-sm">
                                    Filtered: <span className="font-bold">
                                        {activeTab === 'normal' ? filteredQuestions.length : filteredComprehensiveQuestions.length}
                                    </span>
                                </span>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-tathir-light-green text-tathir-dark-green 
                                     font-bold rounded-xl hover:bg-tathir-cream transition-all duration-300 
                                     shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                                     border-2 border-tathir-light-green hover:border-tathir-cream text-xs sm:text-sm lg:text-base"
                        >
                            {loading ? (
                                <FaSpinner className="animate-spin text-sm sm:text-base" />
                            ) : (
                                <FaSpinner className="text-sm sm:text-base" />
                            )}
                            <span className="hidden sm:inline">Reload from Database</span>
                            <span className="sm:hidden">Reload</span>
                        </button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-tathir-cream rounded-xl p-1 sm:p-2 mb-6 shadow-lg border-2 border-tathir-brown">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                            onClick={() => setActiveTab('normal')}
                            className={`flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-bold transition-all duration-300 flex-1 justify-center text-xs sm:text-sm lg:text-base ${
                                activeTab === 'normal'
                                    ? 'bg-tathir-dark-green text-tathir-cream shadow-lg'
                                    : 'bg-transparent text-tathir-maroon hover:bg-tathir-beige'
                            }`}
                        >
                            <FaQuestionCircle className="text-sm sm:text-base" />
                            <span className="hidden xs:inline">Normal Questions</span>
                            <span className="xs:hidden">Normal</span>
                            <span className="bg-tathir-maroon text-tathir-cream px-1 sm:px-2 py-1 rounded-full text-xs">
                                {totalCount}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('comprehensive')}
                            className={`flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-bold transition-all duration-300 flex-1 justify-center text-xs sm:text-sm lg:text-base ${
                                activeTab === 'comprehensive'
                                    ? 'bg-tathir-dark-green text-tathir-cream shadow-lg'
                                    : 'bg-transparent text-tathir-maroon hover:bg-tathir-beige'
                            }`}
                        >
                            <FaLayerGroup className="text-sm sm:text-base" />
                            <span className="hidden xs:inline">Comprehensive Questions</span>
                            <span className="xs:hidden">Comprehensive</span>
                            <span className="bg-tathir-maroon text-tathir-cream px-1 sm:px-2 py-1 rounded-full text-xs">
                                {comprehensiveTotalCount}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Filter Component */}
                <QuestionsFilter
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                    selectedSubCategory={selectedSubCategory}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    categories={categories}
                    subCategories={subCategories}
                    onSearchChange={setSearchTerm}
                    onCategoryChange={setSelectedCategory}
                    onSubCategoryChange={setSelectedSubCategory}
                    onSortChange={(field) => {
                        if (sortBy === field) {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                            setSortBy(field);
                            setSortOrder('asc');
                        }
                    }}
                />

                {/* Tab Content */}
                {activeTab === 'normal' ? (
                    <NormalQuestionsTab
                        searchTerm={searchTerm}
                        selectedCategory={selectedCategory}
                        selectedSubCategory={selectedSubCategory}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onRefresh={handleRefresh}
                    />
                ) : (
                    <ComprehensiveQuestionsTab
                        searchTerm={searchTerm}
                        selectedCategory={selectedCategory}
                        selectedSubCategory={selectedSubCategory}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onRefresh={handleRefresh}
                    />
                )}
            </div>
        </div>
    );
};

export default AllQuestionsPage;