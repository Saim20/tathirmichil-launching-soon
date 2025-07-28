"use client";

import React, { useState } from 'react';
import { useQuestions } from '@/hooks/useQuestions';
import { Question, updateQuestion } from '@/lib/apis/questions';
import { uploadQuestionImage, deleteQuestionImage, validateImageFile } from '@/lib/utils/imageUpload';
import { 
    FaSearch, 
    FaFilter, 
    FaEdit, 
    FaSync, 
    FaSpinner,
    FaExclamationTriangle,
    FaQuestionCircle,
    FaSortAlphaDown,
    FaSortAlphaUp,
    FaChevronDown,
    FaChevronUp,
    FaSave,
    FaTimes,
    FaPlus,
    FaMinus,
    FaImage,
    FaTrash,
    FaCloudUploadAlt
} from 'react-icons/fa';
import { bloxat } from '@/components/fonts';

interface NormalQuestionsTabProps {
    searchTerm: string;
    selectedCategory: string;
    selectedSubCategory: string;
    sortBy: 'title' | 'category' | 'subCategory';
    sortOrder: 'asc' | 'desc';
    onRefresh: () => void;
}

const NormalQuestionsTab: React.FC<NormalQuestionsTabProps> = ({
    searchTerm,
    selectedCategory,
    selectedSubCategory,
    sortBy,
    sortOrder,
    onRefresh
}) => {
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Question>>({});
    const [updateLoading, setUpdateLoading] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const {
        filteredQuestions,
        loading,
        error,
        refreshQuestions,
        updateLocalQuestion,
        totalCount
    } = useQuestions({
        searchTerm,
        category: selectedCategory,
        subCategory: selectedSubCategory,
        sortBy,
        sortOrder,
        includeComprehensive: false // Only normal questions
    });

    const handleRefresh = async () => {
        await refreshQuestions();
        onRefresh();
    };

    const handleEdit = (question: Question) => {
        setEditingQuestion(question.id!);
        setEditFormData({
            title: question.title,
            options: [...question.options],
            answer: question.answer,
            explanation: question.explanation,
            category: question.category,
            subCategory: question.subCategory,
            imageUrl: question.imageUrl
        });
        setUpdateError(null);
        setUpdateSuccess(null);
        setImageError(null);
        // Auto-expand the question when editing
        setExpandedQuestion(question.id!);
    };

    const handleCancelEdit = () => {
        setEditingQuestion(null);
        setEditFormData({});
        setUpdateError(null);
        setUpdateSuccess(null);
        setImageError(null);
    };

    const handleSaveEdit = async (questionId: string) => {
        if (!editFormData.title?.trim() || !editFormData.options?.length || !editFormData.answer?.trim() || !editFormData.category?.trim()) {
            setUpdateError('Please fill in all required fields');
            return;
        }

        setUpdateLoading(questionId);
        setUpdateError(null);

        try {
            const response = await updateQuestion(questionId, editFormData);
            
            if (response.success) {
                setUpdateSuccess(questionId);
                setEditingQuestion(null);
                
                // Optimistic update: Update local data directly instead of refreshing from server
                updateLocalQuestion(questionId, editFormData);
                
                setEditFormData({});
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setUpdateSuccess(null);
                }, 3000);
            } else {
                setUpdateError(response.error || 'Failed to update question');
            }
        } catch (error) {
            setUpdateError('Failed to update question');
        } finally {
            setUpdateLoading(null);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(editFormData.options || [])];
        newOptions[index] = value;
        setEditFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        const newOptions = [...(editFormData.options || []), ''];
        setEditFormData(prev => ({ ...prev, options: newOptions }));
    };

    const removeOption = (index: number) => {
        if ((editFormData.options?.length || 0) <= 2) return; // Minimum 2 options
        const newOptions = [...(editFormData.options || [])];
        newOptions.splice(index, 1);
        setEditFormData(prev => ({ ...prev, options: newOptions }));
        
        // If the removed option was the answer, clear the answer
        if (editFormData.answer === editFormData.options?.[index]) {
            setEditFormData(prev => ({ ...prev, answer: '' }));
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editingQuestion) return;

        // Validate the image file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            setImageError(validation.error || 'Invalid image file');
            return;
        }

        setImageUploading(true);
        setImageError(null);

        try {
            // Delete the old image if it exists
            if (editFormData.imageUrl) {
                try {
                    await deleteQuestionImage(editFormData.imageUrl);
                } catch (deleteError) {
                    console.warn('Failed to delete old image:', deleteError);
                    // Continue with upload even if deletion fails
                }
            }

            // Upload the new image
            const imageUrl = await uploadQuestionImage(file, editingQuestion);
            
            // Update the form data
            setEditFormData(prev => ({ ...prev, imageUrl }));
            
        } catch (error) {
            setImageError(error instanceof Error ? error.message : 'Failed to upload image');
        } finally {
            setImageUploading(false);
            // Clear the input
            event.target.value = '';
        }
    };

    const handleImageRemove = async () => {
        if (!editFormData.imageUrl) return;

        setImageUploading(true);
        setImageError(null);

        try {
            await deleteQuestionImage(editFormData.imageUrl);
            setEditFormData(prev => ({ ...prev, imageUrl: undefined }));
        } catch (error) {
            setImageError(error instanceof Error ? error.message : 'Failed to remove image');
        } finally {
            setImageUploading(false);
        }
    };

    const toggleQuestionExpansion = (questionId: string) => {
        setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
    };

    const getLetterFromIndex = (index: number): string => {
        return String.fromCharCode(65 + index); // A, B, C, D...
    };

    if (loading && filteredQuestions.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-tathir-dark-green mb-4 mx-auto" />
                    <p className="text-lg text-tathir-maroon font-semibold">Loading Normal Questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <FaQuestionCircle className="text-2xl text-tathir-dark-green" />
                    <h2 className={`text-2xl font-bold text-tathir-maroon ${bloxat.className}`}>
                        Normal Questions ({totalCount})
                    </h2>
                </div>
                
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-tathir-light-green text-tathir-dark-green 
                             font-bold rounded-lg hover:bg-tathir-cream transition-all duration-300 
                             shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                             border-2 border-tathir-light-green hover:border-tathir-cream"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSync />}
                    Reload Questions
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 p-4 rounded-xl flex items-center gap-2">
                    <FaExclamationTriangle className="text-xl" />
                    {error}
                </div>
            )}

            {/* Questions List */}
            {filteredQuestions.length === 0 && !loading ? (
                <div className="bg-tathir-cream rounded-xl p-12 text-center border-2 border-tathir-brown">
                    <FaQuestionCircle className="text-6xl text-tathir-maroon/50 mx-auto mb-4" />
                    <h3 className={`text-2xl font-bold text-tathir-maroon mb-2 ${bloxat.className}`}>
                        No Normal Questions Found
                    </h3>
                    <p className="text-tathir-brown">
                        {searchTerm || selectedCategory || selectedSubCategory
                            ? 'Try adjusting your search filters'
                            : 'No normal questions available'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredQuestions.map((question, index) => (
                        <div
                            key={question.id || index}
                            className="bg-tathir-cream rounded-xl border-2 border-tathir-brown shadow-lg 
                                     hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            {/* Question Header */}
                            <div className="p-6 border-b-2 border-tathir-brown/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-tathir-dark-green text-tathir-cream px-3 py-1 rounded-full text-sm font-bold">
                                                #{index + 1}
                                            </span>
                                            <span className="bg-tathir-maroon text-tathir-cream px-3 py-1 rounded-full text-sm font-bold">
                                                {question.category}
                                            </span>
                                            {question.subCategory && (
                                                <span className="bg-tathir-brown text-tathir-cream px-3 py-1 rounded-full text-sm font-bold">
                                                    {question.subCategory}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`text-lg font-bold text-tathir-maroon ${bloxat.className}`}>
                                            {question.title}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(question)}
                                            className="p-2 bg-tathir-light-green text-tathir-dark-green rounded-lg 
                                                     hover:bg-tathir-dark-green hover:text-tathir-cream 
                                                     transition-all duration-300 shadow-md hover:shadow-lg"
                                        >
                                            <FaEdit />
                                        </button>
                                        
                                        <button
                                            onClick={() => toggleQuestionExpansion(question.id!)}
                                            className="p-2 bg-tathir-maroon text-tathir-cream rounded-lg 
                                                     hover:bg-tathir-dark-green transition-all duration-300 
                                                     shadow-md hover:shadow-lg"
                                        >
                                            {expandedQuestion === question.id ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Question Details */}
                            {expandedQuestion === question.id && (
                                <div className="p-6 bg-tathir-cream/50">
                                    {editingQuestion === question.id ? (
                                        /* Edit Form */
                                        <div className="space-y-4">
                                            {/* Title */}
                                            <div>
                                                <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                                                    Question Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editFormData.title || ''}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                             focus:border-tathir-dark-green focus:outline-none"
                                                    placeholder="Enter question title"
                                                />
                                            </div>

                                            {/* Category */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                                                        Category *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.category || ''}
                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                                                        className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                                 focus:border-tathir-dark-green focus:outline-none"
                                                        placeholder="Enter category"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                                                        Sub Category
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.subCategory || ''}
                                                        onChange={(e) => setEditFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                                                        className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                                 focus:border-tathir-dark-green focus:outline-none"
                                                        placeholder="Enter sub category"
                                                    />
                                                </div>
                                            </div>

                                            {/* Options */}
                                            <div>
                                                <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                                                    Options *
                                                </label>
                                                <div className="space-y-2">
                                                    {editFormData.options?.map((option, optionIndex) => (
                                                        <div key={optionIndex} className="flex items-center gap-2">
                                                            <span className="bg-tathir-dark-green text-tathir-cream px-2 py-1 rounded text-sm font-bold">
                                                                {getLetterFromIndex(optionIndex)}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={option}
                                                                onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                                                                className="flex-1 px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                                         focus:border-tathir-dark-green focus:outline-none"
                                                                placeholder={`Option ${getLetterFromIndex(optionIndex)}`}
                                                            />
                                                            {(editFormData.options?.length || 0) > 2 && (
                                                                <button
                                                                    onClick={() => removeOption(optionIndex)}
                                                                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                                                >
                                                                    <FaMinus />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={addOption}
                                                        className="flex items-center gap-2 px-4 py-2 bg-tathir-light-green 
                                                                 text-tathir-dark-green rounded-lg hover:bg-tathir-dark-green 
                                                                 hover:text-tathir-cream transition-all duration-300"
                                                    >
                                                        <FaPlus />
                                                        Add Option
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Answer */}
                                            <div>
                                                <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                                                    Correct Answer *
                                                </label>
                                                <select
                                                    value={editFormData.answer || ''}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, answer: e.target.value }))}
                                                    className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                             focus:border-tathir-dark-green focus:outline-none"
                                                >
                                                    <option value="">Select correct answer</option>
                                                    {editFormData.options?.map((option, optionIndex) => (
                                                        <option key={optionIndex} value={option}>
                                                            {getLetterFromIndex(optionIndex)}. {option}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Explanation */}
                                            <div>
                                                <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                                                    Explanation
                                                </label>
                                                <textarea
                                                    value={editFormData.explanation || ''}
                                                    onChange={(e) => setEditFormData(prev => ({ ...prev, explanation: e.target.value }))}
                                                    rows={4}
                                                    className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                             focus:border-tathir-dark-green focus:outline-none"
                                                    placeholder="Enter explanation"
                                                />
                                            </div>

                                            {/* Image Upload */}
                                            <div>
                                                <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                                                    Question Image
                                                </label>
                                                <div className="space-y-2">
                                                    {editFormData.imageUrl && (
                                                        <div className="relative">
                                                            <img
                                                                src={editFormData.imageUrl}
                                                                alt="Question"
                                                                className="w-full max-w-md h-auto rounded-lg border-2 border-tathir-brown"
                                                            />
                                                            <button
                                                                onClick={handleImageRemove}
                                                                disabled={imageUploading}
                                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full 
                                                                         hover:bg-red-600 transition-colors disabled:opacity-50"
                                                            >
                                                                <FaTrash className="text-xs" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            disabled={imageUploading}
                                                            className="hidden"
                                                            id={`image-upload-${question.id}`}
                                                        />
                                                        <label
                                                            htmlFor={`image-upload-${question.id}`}
                                                            className="flex items-center gap-2 px-4 py-2 bg-tathir-light-green 
                                                                     text-tathir-dark-green rounded-lg hover:bg-tathir-dark-green 
                                                                     hover:text-tathir-cream transition-all duration-300 cursor-pointer
                                                                     disabled:opacity-50"
                                                        >
                                                            {imageUploading ? (
                                                                <FaSpinner className="animate-spin" />
                                                            ) : (
                                                                <FaCloudUploadAlt />
                                                            )}
                                                            {imageUploading ? 'Uploading...' : 'Upload Image'}
                                                        </label>
                                                    </div>
                                                    {imageError && (
                                                        <p className="text-red-500 text-sm">{imageError}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-4 pt-4">
                                                <button
                                                    onClick={() => handleSaveEdit(question.id!)}
                                                    disabled={updateLoading === question.id}
                                                    className="flex items-center gap-2 px-6 py-3 bg-tathir-dark-green 
                                                             text-tathir-cream font-bold rounded-lg hover:bg-tathir-maroon 
                                                             transition-all duration-300 shadow-lg hover:shadow-xl 
                                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {updateLoading === question.id ? (
                                                        <FaSpinner className="animate-spin" />
                                                    ) : (
                                                        <FaSave />
                                                    )}
                                                    {updateLoading === question.id ? 'Saving...' : 'Save Changes'}
                                                </button>
                                                
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white 
                                                             font-bold rounded-lg hover:bg-gray-600 transition-all duration-300 
                                                             shadow-lg hover:shadow-xl"
                                                >
                                                    <FaTimes />
                                                    Cancel
                                                </button>
                                            </div>

                                            {/* Error/Success Messages */}
                                            {updateError && (
                                                <div className="bg-red-100 border-2 border-red-400 text-red-700 p-3 rounded-lg">
                                                    {updateError}
                                                </div>
                                            )}
                                            
                                            {updateSuccess === question.id && (
                                                <div className="bg-green-100 border-2 border-green-400 text-green-700 p-3 rounded-lg">
                                                    Question updated successfully!
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* View Mode */
                                        <div className="space-y-4">
                                            {/* Question Image */}
                                            {question.imageUrl && (
                                                <div className="mb-4">
                                                    <img
                                                        src={question.imageUrl}
                                                        alt="Question"
                                                        className="w-full max-w-md h-auto rounded-lg border-2 border-tathir-brown"
                                                    />
                                                </div>
                                            )}

                                            {/* Options */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-tathir-maroon mb-2">Options:</h4>
                                                <div className="space-y-2">
                                                    {question.options.map((option, optionIndex) => (
                                                        <div
                                                            key={optionIndex}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                                                                option === question.answer
                                                                    ? 'bg-green-100 border-green-400 text-green-800'
                                                                    : 'bg-tathir-cream border-tathir-brown/30'
                                                            }`}
                                                        >
                                                            <span className={`px-2 py-1 rounded text-sm font-bold ${
                                                                option === question.answer
                                                                    ? 'bg-green-500 text-white'
                                                                    : 'bg-tathir-dark-green text-tathir-cream'
                                                            }`}>
                                                                {getLetterFromIndex(optionIndex)}
                                                            </span>
                                                            <span className="flex-1">{option}</span>
                                                            {option === question.answer && (
                                                                <span className="text-green-600 font-bold">✓ Correct</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Explanation */}
                                            {question.explanation && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-tathir-maroon mb-2">Explanation:</h4>
                                                    <div className="p-4 bg-tathir-light-green/30 rounded-lg border-2 border-tathir-light-green">
                                                        <p className="text-tathir-maroon">{question.explanation}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NormalQuestionsTab;
