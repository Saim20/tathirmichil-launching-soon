"use client";

import React, { useState } from "react";
import { useQuestions } from "@/hooks/useQuestions";
import {
  ComprehensiveQuestion,
  updateComprehensiveQuestion,
} from "@/lib/apis/comprehensive-questions";
import { Question } from "@/lib/apis/questions";
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
  FaLayerGroup,
  FaList,
} from "react-icons/fa";
import { bloxat } from "@/components/fonts";

interface ComprehensiveQuestionsTabProps {
  searchTerm: string;
  selectedCategory: string;
  selectedSubCategory: string;
  sortBy: "title" | "category" | "subCategory";
  sortOrder: "asc" | "desc";
  onRefresh: () => void;
}

const ComprehensiveQuestionsTab: React.FC<ComprehensiveQuestionsTabProps> = ({
  searchTerm,
  selectedCategory,
  selectedSubCategory,
  sortBy,
  sortOrder,
  onRefresh,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<
    Partial<ComprehensiveQuestion>
  >({});
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const {
    filteredComprehensiveQuestions,
    loading,
    error,
    refreshQuestions,
    updateLocalComprehensiveQuestion,
    comprehensiveTotalCount,
  } = useQuestions({
    searchTerm,
    category: selectedCategory,
    subCategory: selectedSubCategory,
    sortBy,
    sortOrder,
    includeComprehensive: true,
  });

  const handleRefresh = async () => {
    await refreshQuestions();
    onRefresh();
  };

  const handleEdit = (comprehensiveQuestion: ComprehensiveQuestion) => {
    setEditingQuestion(comprehensiveQuestion.id!);
    setEditFormData({
      title: comprehensiveQuestion.title,
      category: comprehensiveQuestion.category,
      subCategory: comprehensiveQuestion.subCategory,
      questions: comprehensiveQuestion.questions.map((q) => ({
        ...q,
        options: [...q.options],
      })),
    });
    setUpdateError(null);
    setUpdateSuccess(null);
    // Auto-expand the question when editing
    setExpandedQuestion(comprehensiveQuestion.id!);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditFormData({});
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleSaveEdit = async (comprehensiveQuestionId: string) => {
    if (
      !editFormData.title?.trim() ||
      !editFormData.category?.trim() ||
      !editFormData.questions?.length
    ) {
      setUpdateError(
        "Please fill in all required fields and ensure at least one question exists"
      );
      return;
    }

    // Validate all questions
    for (let i = 0; i < editFormData.questions!.length; i++) {
      const question = editFormData.questions![i];
      if (
        !question.title?.trim() ||
        !question.options?.length ||
        !question.answer?.trim()
      ) {
        setUpdateError(`Question ${i + 1} is missing required fields`);
        return;
      }
      if (question.options.length < 2) {
        setUpdateError(`Question ${i + 1} must have at least 2 options`);
        return;
      }
      if (!question.options.includes(question.answer)) {
        setUpdateError(
          `Question ${i + 1}: Answer must be one of the provided options`
        );
        return;
      }
    }

    setUpdateLoading(comprehensiveQuestionId);
    setUpdateError(null);

    try {
      const response = await updateComprehensiveQuestion(
        comprehensiveQuestionId,
        {
          title: editFormData.title,
          category: editFormData.category,
          subCategory: editFormData.subCategory,
          questions: editFormData.questions!.map((q) => ({
            title: q.title,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation || "",
            category: q.category,
            subCategory: q.subCategory,
            imageUrl: q.imageUrl,
          })),
        }
      );

      if (response.success) {
        setUpdateSuccess(comprehensiveQuestionId);
        setEditingQuestion(null);

        // Optimistic update
        updateLocalComprehensiveQuestion(comprehensiveQuestionId, editFormData);

        setEditFormData({});

        // Clear success message after 3 seconds
        setTimeout(() => {
          setUpdateSuccess(null);
        }, 3000);
      } else {
        setUpdateError(
          response.error || "Failed to update comprehensive question"
        );
      }
    } catch (error) {
      setUpdateError("Failed to update comprehensive question");
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleQuestionChange = (
    questionIndex: number,
    field: keyof Question,
    value: any
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      questions: prev.questions?.map((q, index) =>
        index === questionIndex ? { ...q, [field]: value } : q
      ),
    }));
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      questions: prev.questions?.map((q, index) =>
        index === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, oIndex) =>
                oIndex === optionIndex ? value : opt
              ),
            }
          : q
      ),
    }));
  };

  const addOption = (questionIndex: number) => {
    setEditFormData((prev) => ({
      ...prev,
      questions: prev.questions?.map((q, index) =>
        index === questionIndex ? { ...q, options: [...q.options, ""] } : q
      ),
    }));
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = editFormData.questions?.[questionIndex];
    if (!question || question.options.length <= 2) return;

    setEditFormData((prev) => ({
      ...prev,
      questions: prev.questions?.map((q, index) => {
        if (index === questionIndex) {
          const newOptions = q.options.filter(
            (_, oIndex) => oIndex !== optionIndex
          );
          return {
            ...q,
            options: newOptions,
            answer: q.answer === q.options[optionIndex] ? "" : q.answer,
          };
        }
        return q;
      }),
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: null,
      title: "",
      options: ["", ""],
      answer: "",
      explanation: "",
      category: editFormData.category || "",
      subCategory: editFormData.subCategory || "",
    };

    setEditFormData((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion],
    }));
  };

  const removeQuestion = (questionIndex: number) => {
    if ((editFormData.questions?.length || 0) <= 1) return;

    setEditFormData((prev) => ({
      ...prev,
      questions: prev.questions?.filter((_, index) => index !== questionIndex),
    }));
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const getLetterFromIndex = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  if (loading && filteredComprehensiveQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-tathir-dark-green mb-4 mx-auto" />
          <p className="text-lg text-tathir-maroon font-semibold">
            Loading Comprehensive Questions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <FaLayerGroup className="text-2xl text-tathir-dark-green" />
          <h2
            className={`text-2xl font-bold text-tathir-maroon ${bloxat.className}`}
          >
            Comprehensive Questions ({comprehensiveTotalCount})
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
      {filteredComprehensiveQuestions.length === 0 && !loading ? (
        <div className="bg-tathir-cream rounded-xl p-12 text-center border-2 border-tathir-brown">
          <FaLayerGroup className="text-6xl text-tathir-maroon/50 mx-auto mb-4" />
          <h3
            className={`text-2xl font-bold text-tathir-maroon mb-2 ${bloxat.className}`}
          >
            No Comprehensive Questions Found
          </h3>
          <p className="text-tathir-brown">
            {searchTerm || selectedCategory || selectedSubCategory
              ? "Try adjusting your search filters"
              : "No comprehensive questions available"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComprehensiveQuestions.map(
            (comprehensiveQuestion, index) => (
              <div
                key={comprehensiveQuestion.id || index}
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
                          {comprehensiveQuestion.category}
                        </span>
                        {comprehensiveQuestion.subCategory && (
                          <span className="bg-tathir-brown text-tathir-cream px-3 py-1 rounded-full text-sm font-bold">
                            {comprehensiveQuestion.subCategory}
                          </span>
                        )}
                        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {comprehensiveQuestion.totalQuestions} Questions
                        </span>
                      </div>
                      <h3
                        className={`text-lg font-bold text-tathir-maroon ${bloxat.className}`}
                      >
                        {comprehensiveQuestion.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(comprehensiveQuestion)}
                        className="p-2 bg-tathir-light-green text-tathir-dark-green rounded-lg 
                                                     hover:bg-tathir-dark-green hover:text-tathir-cream 
                                                     transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() =>
                          toggleQuestionExpansion(comprehensiveQuestion.id!)
                        }
                        className="p-2 bg-tathir-maroon text-tathir-cream rounded-lg 
                                                     hover:bg-tathir-dark-green transition-all duration-300 
                                                     shadow-md hover:shadow-lg"
                      >
                        {expandedQuestion === comprehensiveQuestion.id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Details */}
                {expandedQuestion === comprehensiveQuestion.id && (
                  <div className="p-6 bg-tathir-cream/50">
                    {editingQuestion === comprehensiveQuestion.id ? (
                      /* Edit Form */
                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                              Title *
                            </label>
                            <input
                              type="text"
                              value={editFormData.title || ""}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                                 focus:border-tathir-dark-green focus:outline-none"
                              placeholder="Enter comprehensive question title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                              Category *
                            </label>
                            <input
                              type="text"
                              value={editFormData.category || ""}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  category: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                                 focus:border-tathir-dark-green focus:outline-none"
                              placeholder="Enter category"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                              Sub Category
                            </label>
                            <input
                              type="text"
                              value={editFormData.subCategory || ""}
                              onChange={(e) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  subCategory: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                                 focus:border-tathir-dark-green focus:outline-none"
                              placeholder="Enter sub category"
                            />
                          </div>
                        </div>

                        {/* Questions */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-semibold text-tathir-maroon">
                              Questions *
                            </label>
                            <button
                              onClick={addQuestion}
                              className="flex items-center gap-2 px-4 py-2 bg-tathir-light-green 
                                                                 text-tathir-dark-green rounded-lg hover:bg-tathir-dark-green 
                                                                 hover:text-tathir-cream transition-all duration-300"
                            >
                              <FaPlus />
                              Add Question
                            </button>
                          </div>

                          <div className="space-y-6">
                            {editFormData.questions?.map(
                              (question, questionIndex) => (
                                <div
                                  key={questionIndex}
                                  className="bg-white p-4 rounded-lg border-2 border-tathir-brown/30"
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-tathir-maroon">
                                      Question {questionIndex + 1}
                                    </h4>
                                    {(editFormData.questions?.length || 0) >
                                      1 && (
                                      <button
                                        onClick={() =>
                                          removeQuestion(questionIndex)
                                        }
                                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                      >
                                        <FaTimes />
                                      </button>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    {/* Question Title */}
                                    <div>
                                      <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                                        Question Title *
                                      </label>
                                      <input
                                        type="text"
                                        value={question.title}
                                        onChange={(e) =>
                                          handleQuestionChange(
                                            questionIndex,
                                            "title",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                                                 focus:border-tathir-dark-green focus:outline-none"
                                        placeholder="Enter question title"
                                      />
                                    </div>

                                    {/* Options */}
                                    <div>
                                      <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                                        Options *
                                      </label>
                                      <div className="space-y-2">
                                        {question.options.map(
                                          (option, optionIndex) => (
                                            <div
                                              key={optionIndex}
                                              className="flex items-center gap-2"
                                            >
                                              <span className="bg-tathir-dark-green text-tathir-cream px-2 py-1 rounded text-sm font-bold">
                                                {getLetterFromIndex(
                                                  optionIndex
                                                )}
                                              </span>
                                              <input
                                                type="text"
                                                value={option}
                                                onChange={(e) =>
                                                  handleOptionChange(
                                                    questionIndex,
                                                    optionIndex,
                                                    e.target.value
                                                  )
                                                }
                                                className="flex-1 px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                                                             focus:border-tathir-dark-green focus:outline-none"
                                                placeholder={`Option ${getLetterFromIndex(
                                                  optionIndex
                                                )}`}
                                              />
                                              {question.options.length > 2 && (
                                                <button
                                                  onClick={() =>
                                                    removeOption(
                                                      questionIndex,
                                                      optionIndex
                                                    )
                                                  }
                                                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                  <FaMinus />
                                                </button>
                                              )}
                                            </div>
                                          )
                                        )}
                                        <button
                                          onClick={() =>
                                            addOption(questionIndex)
                                          }
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
                                        value={question.answer}
                                        onChange={(e) =>
                                          handleQuestionChange(
                                            questionIndex,
                                            "answer",
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                                                 focus:border-tathir-dark-green focus:outline-none"
                                      >
                                        <option value="">
                                          Select correct answer
                                        </option>
                                        {question.options.map(
                                          (option, optionIndex) => (
                                            <option
                                              key={optionIndex}
                                              value={option}
                                            >
                                              {getLetterFromIndex(optionIndex)}.{" "}
                                              {option}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>

                                    {/* Explanation */}
                                    <div>
                                      <label className="block text-sm font-semibold text-tathir-maroon mb-2">
                                        Explanation
                                      </label>
                                      <textarea
                                        value={question.explanation}
                                        onChange={(e) =>
                                          handleQuestionChange(
                                            questionIndex,
                                            "explanation",
                                            e.target.value
                                          )
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2 border-2 border-tathir-brown rounded-lg 
                                                                                 focus:border-tathir-dark-green focus:outline-none"
                                        placeholder="Enter explanation"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 pt-4">
                          <button
                            onClick={() =>
                              handleSaveEdit(comprehensiveQuestion.id!)
                            }
                            disabled={
                              updateLoading === comprehensiveQuestion.id
                            }
                            className="flex items-center gap-2 px-6 py-3 bg-tathir-dark-green 
                                                             text-tathir-cream font-bold rounded-lg hover:bg-tathir-maroon 
                                                             transition-all duration-300 shadow-lg hover:shadow-xl 
                                                             disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updateLoading === comprehensiveQuestion.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaSave />
                            )}
                            {updateLoading === comprehensiveQuestion.id
                              ? "Saving..."
                              : "Save Changes"}
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

                        {updateSuccess === comprehensiveQuestion.id && (
                          <div className="bg-green-100 border-2 border-green-400 text-green-700 p-3 rounded-lg">
                            Comprehensive question updated successfully!
                          </div>
                        )}
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="space-y-6">
                        <div className="space-y-4">
                          {comprehensiveQuestion.questions.map(
                            (question, questionIndex) => (
                              <div
                                key={questionIndex}
                                className="bg-white p-4 rounded-lg border-2 border-tathir-brown/30"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="bg-tathir-dark-green text-tathir-cream px-3 py-1 rounded-full text-sm font-bold">
                                    Q{questionIndex + 1}
                                  </span>
                                  <h4 className="text-lg font-bold text-tathir-maroon">
                                    {question.title}
                                  </h4>
                                </div>

                                {/* Question Image */}
                                {question.imageUrl && (
                                  <div className="mb-4">
                                    <img
                                      src={question.imageUrl}
                                      alt={`Question ${questionIndex + 1}`}
                                      className="w-full max-w-md h-auto rounded-lg border-2 border-tathir-brown"
                                    />
                                  </div>
                                )}

                                {/* Options */}
                                <div className="space-y-2 mb-4">
                                  {question.options.map(
                                    (option, optionIndex) => (
                                      <div
                                        key={optionIndex}
                                        className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                                          option === question.answer
                                            ? "bg-green-100 border-green-400 text-green-800"
                                            : "bg-tathir-cream border-tathir-brown/30"
                                        }`}
                                      >
                                        <span
                                          className={`px-2 py-1 rounded text-sm font-bold ${
                                            option === question.answer
                                              ? "bg-green-500 text-white"
                                              : "bg-tathir-dark-green text-tathir-cream"
                                          }`}
                                        >
                                          {getLetterFromIndex(optionIndex)}
                                        </span>
                                        <span className="flex-1">{option}</span>
                                        {option === question.answer && (
                                          <span className="text-green-600 font-bold">
                                            ✓ Correct
                                          </span>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>

                                {/* Explanation */}
                                {question.explanation && (
                                  <div className="p-4 bg-tathir-light-green/30 rounded-lg border-2 border-tathir-light-green">
                                    <h5 className="text-sm font-semibold text-tathir-maroon mb-2">
                                      Explanation:
                                    </h5>
                                    <p className="text-tathir-maroon">
                                      {question.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ComprehensiveQuestionsTab;
