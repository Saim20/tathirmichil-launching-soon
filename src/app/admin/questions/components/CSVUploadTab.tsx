"use client";

import React, { useState } from "react";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import Papa from "papaparse";
import {
  FaCloudUploadAlt,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaTrash,
} from "react-icons/fa";

interface CSVRow {
  "Question Number": string;
  Questions: string;
  "Option A": string;
  "Option B": string;
  "Option C": string;
  "Option D": string;
  "Option E": string;
  "Answer Key": string;
  Explanation: string;
  [key: string]: string;
}

interface ParsedQuestion {
  title: string;
  options: string[];
  answer: string;
  explanation: string;
  category: string;
  subCategory: string;
  random: number;
  originalRow: number;
  isValid: boolean;
  errors: string[];
}

const CSVUploadTab: React.FC = () => {
  const [csvData, setCsvData] = useState({
    category: "Math",
    subCategory: "",
    file: null as File | null,
  });
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
    errors: [] as string[],
  });

  const validateQuestion = (
    question: Omit<ParsedQuestion, "isValid" | "errors">,
    rowNum: number
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!question.title.trim()) {
      errors.push(`Row ${rowNum}: Question title is required`);
    }

    if (question.options.length < 2) {
      errors.push(`Row ${rowNum}: At least 2 options are required`);
    }

    if (!question.answer.trim()) {
      errors.push(`Row ${rowNum}: Answer is required`);
    } else if (!question.options.includes(question.answer)) {
      errors.push(
        `Row ${rowNum}: Answer "${question.answer}" doesn't match any option`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const parseCSVRow = (row: CSVRow, rowNum: number): ParsedQuestion => {
    const options: string[] = [];
    const optionKeys = [
      "Option A",
      "Option B",
      "Option C",
      "Option D",
      "Option E",
    ];
    const answerKey = row["Answer Key"].toUpperCase().trim();

    // Build options array, excluding empty options
    optionKeys.forEach((key) => {
      const value = row[key];
      if (value && value.trim()) {
        options.push(value.trim());
      }
    });

    // Find the correct answer based on the answer key
    let answer = "";
    const keyIndex = answerKey.charCodeAt(0) - 65; // Convert A=0, B=1, C=2, etc.
    if (keyIndex >= 0 && keyIndex < options.length) {
      answer = options[keyIndex] || "";
    }

    const baseQuestion = {
      title: row.Questions.trim(),
      options,
      answer,
      explanation: row.Explanation.trim(),
      category: csvData.category,
      subCategory: csvData.subCategory,
      random: Math.floor(Math.random() * 5000) + 1,
      originalRow: rowNum,
    };

    const validation = validateQuestion(baseQuestion, rowNum);

    return {
      ...baseQuestion,
      isValid: validation.isValid,
      errors: validation.errors,
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvData({ ...csvData, file });
    setUploadStatus("");
    setParsedQuestions([]);
    setShowPreview(false);
    setValidationSummary({ total: 0, valid: 0, invalid: 0, errors: [] });

    // Parse CSV for preview
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const rows = results.data as CSVRow[];
        const parsed: ParsedQuestion[] = [];
        const allErrors: string[] = [];

        rows.forEach((row, index) => {
          // Skip empty rows
          if (!row.Questions || !row.Questions.trim()) return;

          const question = parseCSVRow(row, index + 2); // +2 because CSV rows start from 2 (header is 1)
          parsed.push(question);

          if (!question.isValid) {
            allErrors.push(...question.errors);
          }
        });

        setParsedQuestions(parsed);
        setValidationSummary({
          total: parsed.length,
          valid: parsed.filter((q) => q.isValid).length,
          invalid: parsed.filter((q) => !q.isValid).length,
          errors: allErrors,
        });
        setShowPreview(true);
      },
      error: (error) => {
        setUploadStatus(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const handleCSVUpload = async () => {
    if (!csvData.file || !csvData.category.trim()) {
      setUploadStatus("Please select a file and category");
      return;
    }

    const validQuestions = parsedQuestions.filter((q) => q.isValid);
    if (validQuestions.length === 0) {
      setUploadStatus("No valid questions to upload");
      return;
    }

    setIsUploading(true);
    setUploadStatus("");

    try {
      const BATCH_SIZE = 500;
      let totalUploaded = 0;

      for (let i = 0; i < validQuestions.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const batchQuestions = validQuestions.slice(i, i + BATCH_SIZE);

        batchQuestions.forEach((question) => {
          const newDocRef = doc(collection(db, "questions"));
          const { isValid, errors, originalRow, ...questionData } = question;
          batch.set(newDocRef, questionData);
        });

        await batch.commit();
        totalUploaded += batchQuestions.length;
        setUploadStatus(
          `Uploaded ${totalUploaded}/${validQuestions.length} questions...`
        );
      }

      setUploadStatus(
        `Successfully uploaded ${validQuestions.length} questions!`
      );

      // Reset form
      setCsvData({
        category: "Math",
        subCategory: "",
        file: null,
      });
      setParsedQuestions([]);
      setShowPreview(false);
      setValidationSummary({ total: 0, valid: 0, invalid: 0, errors: [] });

      // Reset file input
      const fileInput = document.getElementById("csvFile") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Clear success message after 5 seconds
      setTimeout(() => setUploadStatus(""), 5000);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setUploadStatus(
        "Error uploading CSV file. Please check the console for details."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeQuestion = (index: number) => {
    const newQuestions = parsedQuestions.filter((_, i) => i !== index);
    setParsedQuestions(newQuestions);

    // Recalculate validation summary
    const allErrors: string[] = [];
    newQuestions.forEach((q) => {
      if (!q.isValid) {
        allErrors.push(...q.errors);
      }
    });

    setValidationSummary({
      total: newQuestions.length,
      valid: newQuestions.filter((q) => q.isValid).length,
      invalid: newQuestions.filter((q) => !q.isValid).length,
      errors: allErrors,
    });
  };

  const getLetterFromIndex = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <FaCloudUploadAlt className="text-xl sm:text-2xl text-tathir-dark-green" />
        <h2 className="text-xl sm:text-2xl font-bold text-tathir-maroon">
          Upload Questions from CSV
        </h2>
      </div>

      {/* Upload Form */}
      <div className="bg-tathir-dark-green py-4 sm:py-6 px-4 sm:px-6 lg:px-10 space-y-4 rounded-xl">
        {/* Category Selection */}
        <div>
          <label className="block text-tathir-beige mb-2 font-medium text-sm sm:text-base">
            Category *
          </label>
          <select
            className="select select-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon w-full text-sm sm:text-base"
            value={csvData.category}
            onChange={(e) =>
              setCsvData({ ...csvData, category: e.target.value })
            }
          >
            <option value="Math">Math</option>
            <option value="English">English</option>
            <option value="Analytical">Analytical</option>
          </select>
        </div>

        {/* Subcategory Input */}
        <div>
          <label className="block text-tathir-beige mb-2 font-medium text-sm sm:text-base">
            Subcategory
          </label>
          <input
            className="input input-bordered bg-tathir-beige focus:ring-0 focus:border-none text-tathir-maroon w-full text-sm sm:text-base"
            placeholder="Enter subcategory (e.g., Probability, Grammar, etc.)"
            value={csvData.subCategory}
            onChange={(e) =>
              setCsvData({ ...csvData, subCategory: e.target.value })
            }
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-tathir-beige mb-2 font-medium text-sm sm:text-base">
            CSV File *
          </label>
          <input
            id="csvFile"
            type="file"
            accept=".csv"
            className="file-input file-input-bordered bg-tathir-beige text-tathir-maroon w-full text-sm sm:text-base"
            onChange={handleFileUpload}
          />

          {/* Sample CSV Format Table */}
          <div className="mt-4 p-3 sm:p-4 bg-white rounded-lg border border-tathir-brown">
            <h5 className="text-tathir-maroon font-semibold mb-3 text-xs sm:text-sm">
              Sample CSV Format:
            </h5>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-tathir-brown bg-white rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-tathir-maroon">
                    <th className="border border-tathir-brown p-1 sm:p-2 text-tathir-cream font-semibold text-xs">
                      Question Number
                    </th>
                    <th className="border border-tathir-brown p-1 sm:p-2 text-tathir-cream font-semibold text-xs">
                      Questions
                    </th>
                    <th className="border border-tathir-brown p-1 sm:p-2 text-tathir-cream font-semibold text-xs">
                      Option A
                    </th>
                    <th className="border border-tathir-brown p-1 sm:p-2 text-tathir-cream font-semibold text-xs">
                      Option B
                    </th>
                    <th className="border border-tathir-brown p-1 sm:p-2 text-tathir-cream font-semibold text-xs">
                      Option C
                    </th>
                    <th className="border border-tathir-brown p-1 sm:p-2 text-tathir-cream font-semibold text-xs">
                      Option D
                    </th>
                    <th className="border border-tathir-brown p-1 sm:p-2 text-tathir-cream font-semibold text-xs">
                      Option E
                    </th>
                    <th className="border border-tathir-brown p-1 sm:p-2 text-tathir-cream font-semibold text-xs">
                      Answer Key
                    </th>
                    <th className="border border-tathir-brown p-1 sm:p-2 text-tathir-cream font-semibold text-xs">
                      Explanation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      1
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      What is 2 + 2?
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      3
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      4
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      5
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      6
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-gray-400 italic text-xs">
                      (empty)
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon font-semibold text-xs">
                      B
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      Basic addition: 2 + 2 = 4
                    </td>
                  </tr>
                  <tr className="bg-tathir-beige">
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      2
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      Which is the capital of France?
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      London
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      Berlin
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      Paris
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      Madrid
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      Rome
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon font-semibold text-xs">
                      C
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-tathir-maroon text-xs">
                      Paris is the capital city of France
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-tathir-dark-green">
              <p>
                •{" "}
                <strong className="text-tathir-maroon">Question Number:</strong> Sequential numbering (optional)
              </p>
              <p>
                • <strong className="text-tathir-maroon">Questions:</strong> The actual question text
              </p>
              <p>
                • <strong className="text-tathir-maroon">Options A-E:</strong> Answer choices (leave empty if not
                needed)
              </p>
              <p>
                •{" "}
                <strong className="text-tathir-maroon">Answer Key:</strong> Letter corresponding to correct option
                (A, B, C, D, or E)
              </p>
              <p>
                •{" "}
                <strong className="text-tathir-maroon">Explanation:</strong> Optional explanation for the correct
                answer
              </p>
            </div>
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div
            className={`text-center py-2 px-3 rounded-lg text-sm sm:text-base ${
              uploadStatus.includes("Success") ||
              uploadStatus.includes("Uploaded")
                ? "text-green-300 bg-green-900"
                : uploadStatus.includes("Error")
                ? "text-red-300 bg-red-900"
                : "text-blue-300 bg-blue-900"
            }`}
          >
            {uploadStatus}
          </div>
        )}

        {/* Upload Button */}
        <button
          className={`w-full text-tathir-beige uppercase font-bold py-3 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
            isUploading
              ? "bg-gray-500"
              : "bg-tathir-maroon hover:bg-tathir-brown"
          }`}
          onClick={handleCSVUpload}
          disabled={isUploading || parsedQuestions.length === 0}
        >
          {isUploading ? (
            <>
              <FaSpinner className="animate-spin text-sm sm:text-base" />
              <span className="hidden sm:inline">Uploading...</span>
              <span className="sm:hidden">Uploading...</span>
            </>
          ) : (
            <>
              <FaCloudUploadAlt className="text-sm sm:text-base" />
              <span className="hidden sm:inline">Upload CSV</span>
              <span className="sm:hidden">Upload</span>
            </>
          )}
        </button>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="bg-tathir-cream rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border-2 border-tathir-brown">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-tathir-maroon">
              CSV Preview
            </h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1 bg-tathir-light-green text-tathir-dark-green rounded-lg hover:bg-tathir-beige transition-colors text-sm sm:text-base"
            >
              {showPreview ? <FaEyeSlash /> : <FaEye />}
              {showPreview ? "Hide" : "Show"} Preview
            </button>
          </div>

          {/* Validation Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-blue-100 p-3 sm:p-4 rounded-lg text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {validationSummary.total}
              </div>
              <div className="text-blue-600 font-semibold text-sm sm:text-base">Total Questions</div>
            </div>
            <div className="bg-green-100 p-3 sm:p-4 rounded-lg text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {validationSummary.valid}
              </div>
              <div className="text-green-600 font-semibold text-sm sm:text-base">
                Valid Questions
              </div>
            </div>
            <div className="bg-red-100 p-3 sm:p-4 rounded-lg text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {validationSummary.invalid}
              </div>
              <div className="text-red-600 font-semibold text-sm sm:text-base">
                Invalid Questions
              </div>
            </div>
          </div>

          {/* Errors Summary */}
          {validationSummary.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <FaExclamationTriangle />
                Validation Errors ({validationSummary.errors.length})
              </h4>
              <div className="max-h-32 overflow-y-auto">
                {validationSummary.errors.slice(0, 10).map((error, index) => (
                  <div key={index} className="text-xs sm:text-sm text-red-600 mb-1">
                    {error}
                  </div>
                ))}
                {validationSummary.errors.length > 10 && (
                  <div className="text-xs sm:text-sm text-red-500 italic">
                    ... and {validationSummary.errors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Questions Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-tathir-brown">
              <thead>
                <tr className="bg-tathir-dark-green text-tathir-cream">
                  <th className="border border-tathir-brown p-1 sm:p-2 text-left text-xs sm:text-sm">
                    Status
                  </th>
                  <th className="border border-tathir-brown p-1 sm:p-2 text-left text-xs sm:text-sm">
                    Row
                  </th>
                  <th className="border border-tathir-brown p-1 sm:p-2 text-left text-xs sm:text-sm">
                    Question
                  </th>
                  <th className="border border-tathir-brown p-1 sm:p-2 text-left text-xs sm:text-sm">
                    Options
                  </th>
                  <th className="border border-tathir-brown p-1 sm:p-2 text-left text-xs sm:text-sm">
                    Answer
                  </th>
                  <th className="border border-tathir-brown p-1 sm:p-2 text-left text-xs sm:text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {parsedQuestions.slice(0, 20).map((question, index) => (
                  <tr
                    key={index}
                    className={`${
                      question.isValid ? "bg-green-50" : "bg-red-50"
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="border border-tathir-brown p-2">
                      {question.isValid ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <FaCheck className="text-xs sm:text-sm" />
                          <span className="hidden sm:inline">Valid</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <FaExclamationTriangle className="text-xs sm:text-sm" />
                          <span className="hidden sm:inline">Invalid</span>
                        </span>
                      )}
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-xs sm:text-sm">
                      {question.originalRow}
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-xs sm:text-sm max-w-xs">
                      <div className="truncate" title={question.title}>
                        {question.title}
                      </div>
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-xs sm:text-sm">
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-1"
                          >
                            <span className="font-semibold text-xs">
                              {getLetterFromIndex(optIndex)}.
                            </span>
                            <span className="truncate text-xs" title={option}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2 text-xs sm:text-sm">
                      <span
                        className={`px-1 sm:px-2 py-1 rounded text-xs ${
                          question.isValid
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {question.answer || "N/A"}
                      </span>
                    </td>
                    <td className="border border-tathir-brown p-1 sm:p-2">
                      <button
                        onClick={() => removeQuestion(index)}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Remove this question"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedQuestions.length > 20 && (
              <div className="text-center py-3 sm:py-4 text-tathir-maroon text-sm sm:text-base">
                Showing first 20 questions of {parsedQuestions.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVUploadTab;
