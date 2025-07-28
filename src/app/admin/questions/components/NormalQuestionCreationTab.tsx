"use client";

import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import {
  FaQuestionCircle,
  FaPlus,
  FaMinus,
  FaSave,
  FaSpinner,
} from "react-icons/fa";

interface Question {
  title: string;
  options: string[];
  answer: string;
  explanation: string;
  category: string;
  subCategory: string;
  random: number;
}

const NormalQuestionCreationTab: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    answer: "",
    explanation: "",
    category: "",
    subCategory: "",
    options: ["", "", "", "", ""],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");

  const handleChangeOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      // Maximum 6 options
      setFormData({ ...formData, options: [...formData.options, ""] });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      // Minimum 2 options
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });

      // If the removed option was the answer, clear the answer
      if (formData.answer === formData.options[index]) {
        setFormData((prev) => ({ ...prev, answer: "" }));
      }
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      setSubmitStatus("Please enter a question title");
      return;
    }
    if (!formData.category.trim()) {
      setSubmitStatus("Please enter a category");
      return;
    }
    if (formData.options.filter((opt) => opt.trim()).length < 2) {
      setSubmitStatus("Please provide at least 2 options");
      return;
    }
    if (!formData.answer.trim()) {
      setSubmitStatus("Please enter the correct answer");
      return;
    }
    if (
      !formData.options.some((opt) => opt.trim() === formData.answer.trim())
    ) {
      setSubmitStatus("The answer must match one of the options");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      const payload: Question = {
        ...formData,
        options: formData.options.filter((opt) => opt.trim()),
        random: Math.floor(Math.random() * 5000) + 1,
      };

      const newDocRef = doc(collection(db, "questions"));
      await setDoc(newDocRef, payload);

      setSubmitStatus("Question added successfully!");
      setFormData({
        title: "",
        answer: "",
        explanation: "",
        category: "",
        subCategory: "",
        options: ["", "", "", ""],
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus(""), 3000);
    } catch (error) {
      console.error("Error adding question:", error);
      setSubmitStatus("Error adding question. Please try again.");
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
        <FaQuestionCircle className="text-xl sm:text-2xl text-tathir-dark-green" />
        <h2 className="text-xl sm:text-2xl font-bold text-tathir-maroon">
          Create Normal Question
        </h2>
      </div>

      {/* Form */}
      <div className="bg-tathir-dark-green py-4 sm:py-6 px-4 sm:px-6 lg:px-10 space-y-4 rounded-xl">
        {/* Title */}
        <div>
          <label className="block text-tathir-beige mb-2 font-medium text-sm sm:text-base">
            Question Title *
          </label>
          <textarea
            className="textarea textarea-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon w-full resize-vertical text-sm sm:text-base"
            placeholder="Enter your question here..."
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

        {/* Options */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
            <label className="block text-tathir-beige font-medium text-sm sm:text-base">
              Options *
            </label>
            <button
              onClick={addOption}
              disabled={formData.options.length >= 6}
              className="flex items-center gap-1 px-3 py-1 bg-tathir-light-green text-tathir-dark-green 
                                     rounded-lg hover:bg-tathir-cream transition-colors duration-200 text-sm font-medium
                                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus className="text-xs" />
              Add Option
            </button>
          </div>
          <div className="space-y-2">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="font-bold text-tathir-beige min-w-[24px] text-sm sm:text-base">
                  {getLetterFromIndex(index)}.
                </span>
                <input
                  className="input input-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon flex-1 text-sm sm:text-base"
                  placeholder={`Option ${getLetterFromIndex(index)}`}
                  value={option}
                  onChange={(e) => handleChangeOption(index, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, answer: option }))
                  }
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 ${
                    formData.answer === option
                      ? "bg-green-500 text-white"
                      : "bg-tathir-beige text-tathir-maroon hover:bg-green-100"
                  }`}
                  title="Set as correct answer"
                >
                  <span className="hidden sm:inline">
                    {formData.answer === option ? "✓ Correct" : "Set Correct"}
                  </span>
                  <span className="sm:hidden">
                    {formData.answer === option ? "✓" : "Set"}
                  </span>
                </button>
                {formData.options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    title="Remove option"
                  >
                    <FaMinus className="text-xs" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!formData.answer && (
            <p className="text-red-300 text-xs sm:text-sm mt-2">
              Please select a correct answer by clicking "Set Correct" on one of
              the options.
            </p>
          )}
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-tathir-beige mb-2 font-medium text-sm sm:text-base">
            Explanation
          </label>
          <textarea
            className="textarea textarea-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon w-full resize-vertical text-sm sm:text-base"
            placeholder="Explain why this is the correct answer (optional)"
            value={formData.explanation}
            onChange={(e) =>
              setFormData({ ...formData, explanation: e.target.value })
            }
            rows={3}
          />
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
              <span className="hidden sm:inline">Adding Question...</span>
              <span className="sm:hidden">Adding...</span>
            </>
          ) : (
            <>
              <FaSave className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Add Question</span>
              <span className="sm:hidden">Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NormalQuestionCreationTab;
