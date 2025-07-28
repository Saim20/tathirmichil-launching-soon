"use client";

import { useState } from "react";
import NormalQuestionCreationTab from "./components/NormalQuestionCreationTab";
import ComprehensiveQuestionCreationTab from "./components/ComprehensiveQuestionCreationTab";
import CSVUploadTab from "./components/CSVUploadTab";
import {
  FaQuestionCircle,
  FaLayerGroup,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { bloxat } from "@/components/fonts";

const QuestionsPage = () => {
  const [activeTab, setActiveTab] = useState<
    "normal" | "comprehensive" | "csv"
  >("normal");

  return (
    <div className="min-h-screen bg-tathir-beige relative overflow-hidden pb-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[35rem] h-[35rem] bg-tathir-maroon/10 rounded-full blur-3xl -top-24 -right-24 animate-pulse"></div>
        <div className="absolute w-[25rem] h-[25rem] bg-tathir-brown/10 rounded-full blur-3xl bottom-0 left-0 animate-pulse delay-1000"></div>
        <div className="absolute w-[20rem] h-[20rem] bg-tathir-dark-green/10 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 relative z-10">
        {/* Header */}
        <div className="bg-tathir-dark-green rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl border-2 sm:border-4 border-tathir-maroon">
          <div className="text-center">
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-tathir-cream mb-2 ${bloxat.className}`}
            >
              Questions Management
            </h1>
            <p className="text-tathir-light-green text-sm sm:text-base lg:text-lg">
              Create and manage normal questions, comprehensive questions, and
              upload from CSV
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-tathir-cream rounded-xl p-1 sm:p-2 mb-6 sm:mb-8 shadow-lg border-2 border-tathir-brown">
          {/* Mobile: Stack tabs vertically */}
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("normal")}
              className={`flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-bold transition-all duration-300 flex-1 justify-center text-xs sm:text-sm lg:text-base ${
                activeTab === "normal"
                  ? "bg-tathir-dark-green text-tathir-cream shadow-lg"
                  : "bg-transparent text-tathir-maroon hover:bg-tathir-beige"
              }`}
            >
              <FaQuestionCircle className="text-sm sm:text-base" />
              <span className="hidden xs:inline">Normal Questions</span>
              <span className="xs:hidden">Normal</span>
            </button>
            <button
              onClick={() => setActiveTab("comprehensive")}
              className={`flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-bold transition-all duration-300 flex-1 justify-center text-xs sm:text-sm lg:text-base ${
                activeTab === "comprehensive"
                  ? "bg-tathir-dark-green text-tathir-cream shadow-lg"
                  : "bg-transparent text-tathir-maroon hover:bg-tathir-beige"
              }`}
            >
              <FaLayerGroup className="text-sm sm:text-base" />
              <span className="hidden xs:inline">Comprehensive Questions</span>
              <span className="xs:hidden">Comprehensive</span>
            </button>
            <button
              onClick={() => setActiveTab("csv")}
              className={`flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-bold transition-all duration-300 flex-1 justify-center text-xs sm:text-sm lg:text-base ${
                activeTab === "csv"
                  ? "bg-tathir-dark-green text-tathir-cream shadow-lg"
                  : "bg-transparent text-tathir-maroon hover:bg-tathir-beige"
              }`}
            >
              <FaCloudUploadAlt className="text-sm sm:text-base" />
              <span className="hidden xs:inline">CSV Upload</span>
              <span className="xs:hidden">CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "normal" && <NormalQuestionCreationTab />}
          {activeTab === "comprehensive" && (
            <ComprehensiveQuestionCreationTab />
          )}
          {activeTab === "csv" && <CSVUploadTab />}
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
