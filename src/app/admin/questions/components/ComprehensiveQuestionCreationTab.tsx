"use client";

import React, { useState } from "react";
import {
  createComprehensiveQuestion,
  CreateComprehensiveQuestion,
} from "@/lib/apis/comprehensive-questions";
import {
  FaLayerGroup,
  FaPlus,
  FaMinus,
  FaSave,
  FaSpinner,
  FaQuestionCircle,
  FaTrash,
} from "react-icons/fa";

interface QuestionData {
  title: string;
  options: string[];
  answer: string;
  explanation: string;
}

const ComprehensiveQuestionCreationTab: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subCategory: "",
    questions: [
      {
        title: "",
        options: ["", "", "", "", ""],
        answer: "",
        explanation: "",
      },
    ] as QuestionData[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");

  const handleQuestionChange = (
    questionIndex: number,
    field: keyof QuestionData,
    value: string | string[]
  ) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [field]: value,
    };
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...formData.questions];
    const newOptions = [...newQuestions[questionIndex].options];
    newOptions[optionIndex] = value;
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: newOptions,
    };
    setFormData({ ...formData, questions: newQuestions });
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...formData.questions];
    if (newQuestions[questionIndex].options.length < 6) {
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: [...newQuestions[questionIndex].options, ""],
      };
      setFormData({ ...formData, questions: newQuestions });
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...formData.questions];
    if (newQuestions[questionIndex].options.length > 2) {
      const removedOption = newQuestions[questionIndex].options[optionIndex];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: newQuestions[questionIndex].options.filter(
          (_, i) => i !== optionIndex
        ),
      };

      // If the removed option was the answer, clear the answer
      if (newQuestions[questionIndex].answer === removedOption) {
        newQuestions[questionIndex].answer = "";
      }

      setFormData({ ...formData, questions: newQuestions });
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          title: "",
          options: ["", "", "", "", ""],
          answer: "",
          explanation: "",
        },
      ],
    });
  };

  const removeQuestion = (questionIndex: number) => {
    if (formData.questions.length > 1) {
      const newQuestions = formData.questions.filter(
        (_, i) => i !== questionIndex
      );
      setFormData({ ...formData, questions: newQuestions });
    }
  };

  const setCorrectAnswer = (questionIndex: number, answer: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      answer,
    };
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      setSubmitStatus("Please enter a comprehensive question title");
      return;
    }
    if (!formData.category.trim()) {
      setSubmitStatus("Please enter a category");
      return;
    }
    if (formData.questions.length === 0) {
      setSubmitStatus("Please add at least one question");
      return;
    }

    // Validate each question
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.title.trim()) {
        setSubmitStatus(`Question ${i + 1}: Please enter a question title`);
        return;
      }
      if (question.options.filter((opt) => opt.trim()).length < 2) {
        setSubmitStatus(`Question ${i + 1}: Please provide at least 2 options`);
        return;
      }
      if (!question.answer.trim()) {
        setSubmitStatus(`Question ${i + 1}: Please select a correct answer`);
        return;
      }
      if (
        !question.options.some((opt) => opt.trim() === question.answer.trim())
      ) {
        setSubmitStatus(
          `Question ${i + 1}: The answer must match one of the options`
        );
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      const payload: CreateComprehensiveQuestion = {
        title: formData.title,
        category: formData.category,
        subCategory: formData.subCategory,
        questions: formData.questions.map((q) => ({
          title: q.title,
          options: q.options.filter((opt) => opt.trim()),
          answer: q.answer,
          explanation: q.explanation,
        })),
        random: Math.floor(Math.random() * 500) + 1,
      };

      const response = await createComprehensiveQuestion(payload);

      if (response.success) {
        setSubmitStatus("Comprehensive question added successfully!");
        setFormData({
          title: "",
          category: "",
          subCategory: "",
          questions: [
            {
              title: "",
              options: ["", "", "", "", ""],
              answer: "",
              explanation: "",
            },
          ],
        });

        // Clear success message after 3 seconds
        setTimeout(() => setSubmitStatus(""), 3000);
      } else {
        setSubmitStatus(
          response.error || "Error adding comprehensive question"
        );
      }
    } catch (error) {
      console.error("Error adding comprehensive question:", error);
      setSubmitStatus("Error adding comprehensive question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLetterFromIndex = (index: number): string => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <FaLayerGroup className="text-xl sm:text-2xl text-tathir-dark-green" />
        <h2 className="text-xl sm:text-2xl font-bold text-tathir-maroon">
          Create Comprehensive Question
        </h2>
      </div>

      {/* Form */}
      <div className="bg-tathir-dark-green py-4 sm:py-6 px-4 sm:px-6 lg:px-10 space-y-4 sm:space-y-6 rounded-xl">
        {/* Title */}
        <div>
          <label className="block text-tathir-beige mb-2 font-medium text-sm sm:text-base">
            Comprehensive Question Title *
          </label>
          <textarea
            className="textarea textarea-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon w-full text-sm sm:text-base"
            placeholder="Enter the main title for this set of questions"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            rows={3}
          />
        </div>

        {/* Category and Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-tathir-beige mb-2 font-medium text-sm sm:text-base">
              Category *
            </label>
            <select
              className="select select-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon w-full text-sm sm:text-base"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              <option value="Math">Math</option>
              <option value="English">English</option>
              <option value="Analytical">Analytical</option>
            </select>
          </div>
          <div>
            <label className="block text-tathir-beige mb-2 font-medium text-sm sm:text-base">
              Subcategory
            </label>
            <input
              className="input input-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon w-full text-sm sm:text-base"
              placeholder="Enter subcategory (optional)"
              value={formData.subCategory}
              onChange={(e) =>
                setFormData({ ...formData, subCategory: e.target.value })
              }
            />
          </div>
        </div>

        {/* Questions */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <label className="block text-tathir-beige font-medium text-sm sm:text-base">
              Questions * ({formData.questions.length})
            </label>
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-tathir-light-green text-tathir-dark-green 
                                     rounded-lg hover:bg-tathir-cream transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              <FaPlus className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Add Question</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {formData.questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                className="bg-tathir-beige/10 p-3 sm:p-4 rounded-lg border border-tathir-beige/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <h4 className="text-tathir-beige font-semibold flex items-center gap-2 text-sm sm:text-base">
                    <FaQuestionCircle className="text-sm sm:text-base" />
                    Question {questionIndex + 1}
                  </h4>
                  {formData.questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(questionIndex)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 self-start sm:self-auto"
                      title="Remove question"
                    >
                      <FaTrash className="text-xs sm:text-sm" />
                    </button>
                  )}
                </div>

                {/* Question Title */}
                <div className="mb-4">
                  <label className="block text-tathir-beige mb-2 text-xs sm:text-sm font-medium">
                    Question Text *
                  </label>
                  <textarea
                    className="textarea textarea-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon w-full resize-vertical text-sm sm:text-base"
                    placeholder="Enter the question text"
                    value={question.title}
                    onChange={(e) =>
                      handleQuestionChange(
                        questionIndex,
                        "title",
                        e.target.value
                      )
                    }
                    rows={2}
                  />
                </div>

                {/* Options */}
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                    <label className="block text-tathir-beige text-xs sm:text-sm font-medium">
                      Options *
                    </label>
                    <button
                      onClick={() => addOption(questionIndex)}
                      disabled={question.options.length >= 6}
                      className="flex items-center gap-1 px-2 py-1 bg-tathir-light-green text-tathir-dark-green 
                                                     rounded text-xs hover:bg-tathir-cream transition-colors duration-200
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPlus className="text-xs" />
                      <span className="hidden sm:inline">Add Option</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-2"
                      >
                        <span className="font-bold text-tathir-beige min-w-[20px] text-xs sm:text-sm">
                          {getLetterFromIndex(optionIndex)}.
                        </span>
                        <input
                          className="input input-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon flex-1 input-sm text-xs sm:text-sm"
                          placeholder={`Option ${getLetterFromIndex(
                            optionIndex
                          )}`}
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(
                              questionIndex,
                              optionIndex,
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setCorrectAnswer(questionIndex, option)
                          }
                          className={`px-1 sm:px-2 py-1 rounded text-xs font-semibold transition-colors duration-200 ${
                            question.answer === option
                              ? "bg-green-500 text-white"
                              : "bg-tathir-beige text-tathir-maroon hover:bg-green-100"
                          }`}
                          title="Set as correct answer"
                        >
                          {question.answer === option ? "✓" : "Set"}
                        </button>
                        {question.options.length > 2 && (
                          <button
                            onClick={() =>
                              removeOption(questionIndex, optionIndex)
                            }
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                            title="Remove option"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {!question.answer && (
                    <p className="text-red-300 text-xs mt-1">
                      Please select a correct answer for this question.
                    </p>
                  )}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-tathir-beige mb-2 text-xs sm:text-sm font-medium">
                    Explanation
                  </label>
                  <textarea
                    className="textarea textarea-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon w-full resize-vertical text-sm sm:text-base"
                    placeholder="Explain the answer (optional)"
                    value={question.explanation}
                    onChange={(e) =>
                      handleQuestionChange(
                        questionIndex,
                        "explanation",
                        e.target.value
                      )
                    }
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Message */}
        {submitStatus && (
          <div
            className={`text-center py-2 px-3 rounded-lg text-sm sm:text-base ${
              submitStatus.includes("success")
                ? "text-green-300 bg-green-900/20"
                : "text-red-300 bg-red-900/20"
            }`}
          >
            {submitStatus}
          </div>
        )}

        {/* Submit Button */}
        <button
          className={`w-full text-tathir-beige uppercase font-bold py-3 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
            isSubmitting
              ? "bg-gray-500"
              : "bg-tathir-maroon hover:bg-tathir-brown"
          }`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin text-sm sm:text-base" />
              <span className="hidden sm:inline">Adding Comprehensive Question...</span>
              <span className="sm:hidden">Adding...</span>
            </>
          ) : (
            <>
              <FaSave className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Add Comprehensive Question</span>
              <span className="sm:hidden">Add Question</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ComprehensiveQuestionCreationTab;
