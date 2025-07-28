import { QuestionWithTimer } from "@/lib/apis/questions";
import { getFontClassName } from "./fonts";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaClock,
  FaQuestionCircle,
  FaBookOpen,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { useState, useEffect } from "react";

interface TestUIProps {
  questions: QuestionWithTimer[];
  currentQuestionIndex: number;
  remainingTime: number;
  font: string;
  className?: string;
  handleJumpToQuestion: (index: number) => void;
  handleOptionSelect: (optionIndex: number | null) => void;
  handlePreviousQuestion: () => void;
  handleNextQuestion: () => void;
  handleSubmit: () => Promise<void>;
  setFont: (font: string) => void;
  onTabSwitchCountChange?: (count: number) => void;
}

export default function TestUI({
  questions,
  currentQuestionIndex,
  remainingTime,
  font,
  className = "",
  handleJumpToQuestion,
  handleOptionSelect,
  handlePreviousQuestion,
  handleNextQuestion,
  handleSubmit,
  setFont,
  onTabSwitchCountChange,
}: TestUIProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  // Security measures
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Handle keyboard navigation and disable shortcuts for screenshots, devtools, etc.
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle arrow key navigation
      if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        e.preventDefault();
        handlePreviousQuestion();
        return;
      }
      if (e.key === "ArrowRight" && currentQuestionIndex < questions.length - 1) {
        e.preventDefault();
        handleNextQuestion();
        return;
      }

      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "U") ||
        // Disable copy shortcuts
        (e.ctrlKey && e.key === "c") ||
        (e.ctrlKey && e.key === "C") ||
        (e.ctrlKey && e.key === "a") ||
        (e.ctrlKey && e.key === "A") ||
        (e.ctrlKey && e.key === "v") ||
        (e.ctrlKey && e.key === "V") ||
        (e.ctrlKey && e.key === "x") ||
        (e.ctrlKey && e.key === "X") ||
        // Disable screenshot shortcuts - enhanced
        e.key === "PrintScreen" ||
        e.code === "PrintScreen" ||
        e.keyCode === 44 ||
        (e.altKey && e.key === "PrintScreen") ||
        (e.altKey && e.code === "PrintScreen") ||
        (e.ctrlKey && e.key === "PrintScreen") ||
        (e.ctrlKey && e.code === "PrintScreen") ||
        (e.shiftKey && e.key === "PrintScreen") ||
        (e.shiftKey && e.code === "PrintScreen") ||
        // Disable print shortcuts
        (e.ctrlKey && e.key === "p") ||
        (e.ctrlKey && e.key === "P") ||
        // Disable tab switching - enhanced
        (e.ctrlKey && e.key === "Tab") ||
        (e.ctrlKey && e.shiftKey && e.key === "Tab") ||
        (e.altKey && e.key === "Tab") ||
        (e.altKey && e.shiftKey && e.key === "Tab") ||
        (e.ctrlKey && e.key >= "1" && e.key <= "9") ||
        (e.ctrlKey && e.key === "w") ||
        (e.ctrlKey && e.key === "W") ||
        (e.ctrlKey && e.key === "t") ||
        (e.ctrlKey && e.key === "T") ||
        (e.ctrlKey && e.key === "n") ||
        (e.ctrlKey && e.key === "N") ||
        (e.altKey && e.key === "F4") ||
        // Disable Windows key combinations
        e.key === "Meta" ||
        e.metaKey ||
        // Disable refresh
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r") ||
        (e.ctrlKey && e.key === "R")
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Enhanced keyup handler for PrintScreen
    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        e.code === "PrintScreen" ||
        e.keyCode === 44
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Clear clipboard to prevent screenshot saving
        if (navigator.clipboard) {
          navigator.clipboard.writeText("").catch(() => {});
        }
        return false;
      }
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Enhanced focus detection to prevent tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Increment tab switch counter
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        onTabSwitchCountChange?.(newCount);
        // Show warning and potentially pause test
        console.warn("Tab switching detected - test security breach");
        alert(
          "Warning: Tab switching detected. This may invalidate your test."
        );
      }
    };

    // Enhanced window focus/blur detection
    const handleWindowBlur = () => {
      // Increment tab switch counter on window blur as well
      const newCount = tabSwitchCount + 1;
      setTabSwitchCount(newCount);
      onTabSwitchCountChange?.(newCount);
      console.warn("Window lost focus - potential tab switch");
    };

    const handleWindowFocus = () => {
      console.log("Window regained focus");
    };

    // Prevent print with enhanced detection
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      alert("Printing is disabled during the test for security reasons.");
      return false;
    };

    const handleAfterPrint = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Media query to detect print mode
    const printMediaQuery = window.matchMedia("print");
    const handlePrintMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        window.location.reload(); // Reload page if print mode is detected
      }
    };

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyUp, true);
    document.addEventListener("selectstart", handleSelectStart, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("visibilitychange", handleVisibilityChange, true);
    window.addEventListener("beforeprint", handleBeforePrint, true);
    window.addEventListener("afterprint", handleAfterPrint, true);
    window.addEventListener("blur", handleWindowBlur, true);
    window.addEventListener("focus", handleWindowFocus, true);
    printMediaQuery.addEventListener("change", handlePrintMediaChange);

    // Disable browser's built-in shortcuts
    document.addEventListener(
      "keydown",
      (e) => {
        if (
          e.ctrlKey ||
          e.metaKey ||
          e.altKey ||
          e.key === "F12" ||
          e.key === "PrintScreen"
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      },
      { capture: true, passive: false }
    );

    // Clean up event listeners
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keyup", handleKeyUp, true);
      document.removeEventListener("selectstart", handleSelectStart, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
        true
      );
      window.removeEventListener("beforeprint", handleBeforePrint, true);
      window.removeEventListener("afterprint", handleAfterPrint, true);
      window.removeEventListener("blur", handleWindowBlur, true);
      window.removeEventListener("focus", handleWindowFocus, true);
      printMediaQuery.removeEventListener("change", handlePrintMediaChange);
    };
  }, [currentQuestionIndex, questions.length, handlePreviousQuestion, handleNextQuestion]);

// Keyboard navigation is now handled in the security measures useEffect

  // Additional security monitoring
  useEffect(() => {
    // Monitor for DevTools - Skip on mobile devices
    let devtools = { open: false, orientation: null };
    const threshold = 160;

    // Detect if we're on a mobile device
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
             (window.innerWidth <= 768);
    };

    const setDevToolsOpen = (state: boolean) => {
      devtools.open = state;
      if (state && !isMobile()) {
        alert("Developer tools detected! This action has been logged.");
        // Optionally redirect or disable test
      }
    };

    const checkDevTools = () => {
      // Skip DevTools detection on mobile devices
      if (isMobile()) {
        return;
      }

      // More sophisticated detection for desktop browsers
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // Account for browser chrome (toolbars, etc.) - typically around 100-130px
      const normalChrome = 130;
      
      if (
        heightDiff > threshold + normalChrome ||
        widthDiff > threshold
      ) {
        if (!devtools.open) {
          setDevToolsOpen(true);
        }
      } else {
        if (devtools.open) {
          setDevToolsOpen(false);
        }
      }
    };

    const intervalId = setInterval(checkDevTools, 500);

    // Monitor clipboard access
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData("text/plain", "");
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Monitor for common screenshot tools
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("paste", handlePaste, true);
    document.addEventListener("contextmenu", handleRightClick, true);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("contextmenu", handleRightClick, true);
    };
  }, []);

  // Additional security CSS styles
  const securityStyles = {
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    MozUserSelect: "none" as const,
    msUserSelect: "none" as const,
    WebkitTouchCallout: "none" as const,
    WebkitUserDrag: "none" as const,
    KhtmlUserSelect: "none" as const,
    pointerEvents: "auto" as const,
  };

  // Helper function to check if this is a comprehensive sub-question
  const isComprehensiveSubQuestion = (question: QuestionWithTimer) => {
    return (question as any).parentId !== undefined;
  };

  // Get comprehensive question info if applicable
  const getComprehensiveInfo = (question: QuestionWithTimer) => {
    if (isComprehensiveSubQuestion(question)) {
      const parentId = (question as any).parentId;
      // Find all questions from the same comprehensive question
      const siblingQuestions = questions.filter(
        (q) => (q as any).parentId === parentId
      );
      const currentIndex = siblingQuestions.findIndex(
        (q) => q.id === question.id
      );
      return {
        isComprehensive: true,
        parentId,
        subQuestionIndex: currentIndex + 1,
        totalSubQuestions: siblingQuestions.length,
      };
    }
    return { isComprehensive: false };
  };

  const currentQuestionInfo = getComprehensiveInfo(currentQuestion);

  // Group questions by category
  const getQuestionsByCategory = () => {
    const categories = {
      Math: [] as { question: QuestionWithTimer; index: number }[],
      English: [] as { question: QuestionWithTimer; index: number }[],
      Analytical: [] as { question: QuestionWithTimer; index: number }[],
    };

    questions.forEach((question, index) => {
      const category = question.category as keyof typeof categories;
      if (categories[category]) {
        categories[category].push({ question, index });
      }
    });

    return categories;
  };

  const questionsByCategory = getQuestionsByCategory();

  // Calculate progress and statistics
  const answeredQuestions = questions.filter((q) => q.selected !== null).length;
  const progressPercentage = (answeredQuestions / questions.length) * 100;

  // Animate progress on answer change
  useEffect(() => {
    setAnimateProgress(true);
    const timer = setTimeout(() => setAnimateProgress(false), 300);
    return () => clearTimeout(timer);
  }, [answeredQuestions]);

  // Time warning logic
  const getTimeColor = () => {
    const totalSeconds = remainingTime;
    const percentage = (totalSeconds / (questions.length * 60)) * 100; // Assuming 1 min per question
    if (percentage <= 10) return "text-tathir-error";
    if (percentage <= 25) return "text-tathir-warning";
    return "text-tathir-success";
  };

  const handleSubmitClick = () => {
    setShowConfirm(true);
  };

  const handleUnselectOption = () => {
    handleOptionSelect(null); // Pass null to indicate unselection
  };

  return (
    <>
      {/* Security CSS */}
      <style jsx global>{`
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-select: none !important;
        }

        body {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }

        html {
          scroll-behavior: smooth;
        }

        /* Disable image context menu */
        img {
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
          pointer-events: none !important;
        }

        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px !important;
          height: 8px !important;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1 !important;
          border-radius: 4px !important;
        }

        ::-webkit-scrollbar-thumb {
          background: #888 !important;
          border-radius: 4px !important;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555 !important;
        }

        * {
          scrollbar-width: thin !important;
          scrollbar-color: #888 #f1f1f1 !important;
        }

        /* Prevent selection highlighting */
        ::selection {
          background: transparent !important;
          color: inherit !important;
        }

        ::-moz-selection {
          background: transparent !important;
          color: inherit !important;
        }

        /* Additional security measures */
        .test-content {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          pointer-events: auto !important;
        }

        .test-content * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }

        /* Disable print styles */
        @media print {
          * {
            display: none !important;
            visibility: hidden !important;
          }

          body::before {
            content: "PRINTING IS DISABLED FOR SECURITY REASONS" !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            font-size: 24px !important;
            font-weight: bold !important;
            color: red !important;
            z-index: 9999 !important;
            display: block !important;
            visibility: visible !important;
          }
        }

        /* Block screenshot apps */
        body::after {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: transparent;
          z-index: -1;
          pointer-events: none;
        }

        /* Disable text highlighting on double click */
        * {
          -webkit-tap-highlight-color: transparent !important;
          -webkit-focus-ring-color: transparent !important;
          outline: none !important;
        }

        /* Block common screenshot tools */
        .test-content {
          background-attachment: fixed !important;
        }
      `}</style>

      <div
        className="min-h-screen bg-tathir-beige relative test-content"
        style={securityStyles}
      >
        {/* Main Container */}
        <div
          className={`flex flex-col lg:flex-row gap-2 w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 ${className} test-content`}
          style={securityStyles}
        >
          {/* Mobile Question Navigation - Always Visible */}
          <div className="lg:hidden w-full">
            <div className="bg-white rounded-lg p-3 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FaBookOpen className="text-tathir-brown text-sm" />
                  <h3 className="text-sm font-bold text-tathir-dark-green">
                    Questions
                  </h3>
                </div>
                <div className="text-xs text-gray-600">
                  {answeredQuestions}/{questions.length} answered
                </div>
              </div>

              {/* Compact Mobile Question Grid */}
              <div className="space-y-3">
                {Object.entries(questionsByCategory).map(
                  ([category, categoryQuestions]) => {
                    if (categoryQuestions.length === 0) return null;

                    return (
                      <div key={category}>
                        <div className="text-xs font-semibold text-tathir-brown mb-2 px-1">
                          {category} ({categoryQuestions.length})
                        </div>
                        <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                          {categoryQuestions.map(({ question, index }) => {
                            const questionInfo = getComprehensiveInfo(question);
                            return (
                              <button
                                key={index}
                                onClick={() => handleJumpToQuestion(index)}
                                className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all min-h-[36px] relative ${
                                  question.selected !== null
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-tathir-dark-green hover:bg-gray-200"
                                } ${
                                  index === currentQuestionIndex
                                    ? "ring-2 ring-tathir-brown ring-offset-1"
                                    : "border"
                                } ${
                                  questionInfo.isComprehensive
                                    ? "ring-1 ring-tathir-brown ring-opacity-50 text-white"
                                    : ""
                                }`}
                                title={
                                  questionInfo.isComprehensive
                                    ? `Comprehensive Question Part ${questionInfo.subQuestionIndex}`
                                    : `Question ${index + 1}`
                                }                                >
                                  {question.selected !== null && (
                                    <FaCheck className="text-[10px]" />
                                  )}
                                  {question.selected === null && (
                                    <span className="text-[10px]">
                                      {index + 1}
                                    </span>
                                  )}
                                  {questionInfo.isComprehensive && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-tathir-brown rounded-full"></div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Mobile Controls Row */}
              <div className="flex items-center justify-between mt-3 gap-3">
                {/* Font Selector */}
                <div className="flex-1 min-w-0">
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-300 rounded-md bg-white text-tathir-dark-green"
                  >
                    <option value={getFontClassName("timesNewRoman")}>
                      Times
                    </option>
                    <option value={getFontClassName("arial")}>Arial</option>
                    <option value={getFontClassName("verdana")}>Verdana</option>
                    <option value={getFontClassName("tahoma")}>Tahoma</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitClick}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold bg-tathir-dark-green text-white rounded-md flex items-center gap-1 hover:bg-tathir-maroon transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
                      <span className="hidden sm:inline">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck className="text-[10px]" />
                      <span className="hidden sm:inline">Submit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Warning for unanswered questions */}
              {answeredQuestions < questions.length && (
                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 rounded-md p-2 mt-2">
                  <FaExclamationTriangle className="text-orange-500 text-xs" />
                  <span>{questions.length - answeredQuestions} unanswered</span>
                </div>
              )}
            </div>
          </div>

          {/* Question Panel */}
          <div className="flex-1 min-w-0 w-full">
            <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-lg">
              {/* Header with Progress */}
              <div className="mb-4 lg:mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-tathir-dark-green rounded-lg flex items-center justify-center">
                      <FaQuestionCircle className="text-white text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg lg:text-xl font-bold text-tathir-dark-green">
                        Question {currentQuestionIndex + 1}
                        {currentQuestionInfo.isComprehensive && (
                          <span className="text-sm font-normal text-tathir-brown ml-2">
                            (Part {currentQuestionInfo.subQuestionIndex} of{" "}
                            {currentQuestionInfo.totalSubQuestions})
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-gray-600">
                        of {questions.length} questions
                        {currentQuestionInfo.isComprehensive && (
                          <span className="text-tathir-brown">
                            {" "}
                            • Comprehensive Question
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Timer Display */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 border">
                    <FaClock className={`text-base ${getTimeColor()}`} />
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getTimeColor()}`}>
                        {minutes}:{seconds.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-500">Time Left</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Progress</span>
                  <span>
                    {answeredQuestions}/{questions.length} answered (
                    {Math.round(progressPercentage)}%)
                  </span>
                </div>
              </div>

              {/* Question Content */}
              <div className="mb-6">
                {currentQuestionInfo.isComprehensive && (
                  <div className="mb-3 p-3 bg-tathir-brown bg-opacity-10 border border-tathir-brown border-opacity-20 rounded-lg text-white">
                    <div className="flex items-center gap-2 text-sm">
                      <FaBookOpen className="text-sm" />
                      <span className="font-medium">
                        Comprehensive Question - Part{" "}
                        {currentQuestionInfo.subQuestionIndex} of{" "}
                        {currentQuestionInfo.totalSubQuestions}
                      </span>
                    </div>
                  </div>
                )}
                <div
                  className={`${font} bg-gray-50 rounded-lg p-4 lg:p-6 border min-h-[100px] flex items-center`}
                  style={securityStyles}
                >
                  <p
                    className="text-base text-black leading-relaxed break-words"
                    style={securityStyles}
                  >
                    {currentQuestion.title}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className={`w-full min-h-[50px] p-4 text-left rounded-lg transition-all duration-200 break-words hover:shadow-md ${font} ${
                      currentQuestion.selected === index
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-white border-2 border-gray-200 hover:border-blue-500 text-black"
                    }`}
                    style={securityStyles}
                  >
                    <div
                      className="flex items-center gap-3"
                      style={securityStyles}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          currentQuestion.selected === index
                            ? "border-white bg-white"
                            : "border-gray-300"
                        }`}
                      >
                        {currentQuestion.selected === index && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      <span className="flex-1" style={securityStyles}>
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
                
                {/* Unselect Button */}
                {currentQuestion.selected !== null && (
                  <button
                    onClick={handleUnselectOption}
                    className="w-full min-h-[50px] p-4 text-center rounded-lg transition-all duration-200 bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-600 flex items-center justify-center gap-2"
                  >
                    <FaTimes className="text-sm" />
                    <span className="font-medium">Unselect Answer</span>
                  </button>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm lg:text-base bg-gray-100 text-tathir-dark-green rounded-lg border hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaArrowLeft className="text-sm" /> Previous
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm lg:text-base bg-tathir-light-green text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-tathir-dark-green"
                >
                  Next <FaArrowRight className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Panel */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="bg-white rounded-lg p-6 shadow-lg space-y-6 sticky top-6">
              {/* Question Grid */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FaBookOpen className="text-tathir-brown text-lg" />
                  <h3 className="text-lg font-bold text-tathir-dark-green">
                    Question Navigation
                  </h3>
                </div>

                <div className="space-y-4">
                  {Object.entries(questionsByCategory).map(
                    ([category, categoryQuestions]) => {
                      if (categoryQuestions.length === 0) return null;

                      return (
                        <div key={category}>
                          <div className="text-sm font-semibold text-tathir-brown mb-2 flex items-center gap-2">
                            <span>{category}</span>
                            <span className="text-xs text-gray-500">
                              ({categoryQuestions.length} questions)
                            </span>
                          </div>
                          <div className="grid grid-cols-6 gap-2">
                            {categoryQuestions.map(({ question, index }) => {
                              const questionInfo =
                                getComprehensiveInfo(question);
                              return (
                                <button
                                  key={index}
                                  onClick={() => handleJumpToQuestion(index)}
                                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-105 relative ${
                                    question.selected !== null
                                      ? "bg-blue-500 text-white shadow-md"
                                      : "bg-gray-100 text-tathir-dark-green hover:bg-gray-200"
                                  } ${
                                    index === currentQuestionIndex
                                      ? "ring-2 ring-tathir-brown ring-offset-1"
                                      : "border"
                                  } ${
                                    questionInfo.isComprehensive
                                      ? "ring-2 ring-tathir-brown ring-opacity-50"
                                      : ""
                                  }`}
                                  title={
                                    questionInfo.isComprehensive
                                      ? `Comprehensive Question Part ${questionInfo.subQuestionIndex}`
                                      : `Question ${index + 1}`
                                  }
                                >
                                  {question.selected !== null && (
                                    <FaCheck className="text-xs" />
                                  )}
                                  {question.selected === null && (
                                    <span>{index + 1}</span>
                                  )}
                                  {questionInfo.isComprehensive && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-tathir-brown rounded-full flex items-center justify-center">
                                      <span className="text-white text-[8px] font-bold">
                                        C
                                      </span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Legend for comprehensive questions */}
                {questions.some((q) => isComprehensiveSubQuestion(q)) && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-3 h-3 bg-tathir-brown rounded-full flex items-center justify-center">
                        <span className="text-white text-[6px] font-bold">
                          C
                        </span>
                      </div>
                      <span>Comprehensive Question Parts</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Font Selector */}
              <div>
                <label className="block text-sm font-semibold text-tathir-dark-green mb-3">
                  Font Style
                </label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full p-3 text-base border-2 border-gray-200 rounded-lg bg-white text-tathir-dark-green focus:border-tathir-brown focus:outline-none transition-colors"
                >
                  <option value={getFontClassName("timesNewRoman")}>
                    Times New Roman
                  </option>
                  <option value={getFontClassName("arial")}>Arial</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="w-full py-4 text-lg font-bold bg-tathir-dark-green text-white rounded-lg flex items-center justify-center gap-3 transition-colors hover:bg-tathir-maroon shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Submitting Test...
                  </>
                ) : (
                  <>
                    <FaCheck className="text-lg" />
                    Submit Test
                  </>
                )}
              </button>

              {answeredQuestions < questions.length && (
                <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 rounded-lg p-3">
                  <FaExclamationTriangle className="text-orange-500" />
                  <span>
                    {questions.length - answeredQuestions} questions unanswered
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full [box-shadow:0_32px_64px_rgba(0,0,0,0.2)] animate-in zoom-in duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="text-orange-500 text-2xl" />
                </div>
                <h3
                  className={`${getFontClassName(
                    "heading"
                  )} text-xl font-bold text-tathir-dark-green mb-4`}
                >
                  Submit Test?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to submit?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 text-base font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Continue Test
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setIsSubmitting(true);
                        await handleSubmit();
                      } finally {
                        setIsSubmitting(false);
                        setShowConfirm(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-1 py-3 text-base font-semibold bg-tathir-dark-green text-white rounded-xl hover:bg-tathir-maroon transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
