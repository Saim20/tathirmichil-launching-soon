"use client";
import React, { useState, useEffect } from "react";
import { useQuestions } from "@/hooks/useQuestions";
import {
  FaPlus,
  FaRandom,
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { createTest, OrderedQuestion, Test } from "@/lib/apis/tests";
import { Question } from "@/lib/apis/questions";
import { ComprehensiveQuestion } from "@/lib/apis/comprehensive-questions";

type TestType = "assessment" | "live" | "practice" | "challenge";
type SelectedQuestion = Question | ComprehensiveQuestion;

import { updateQuestion } from "@/lib/apis/questions";
import { useMemo } from "react";
import { Button } from "@/components/shared/ui/Button";
import { bloxat } from "@/components/fonts";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { ContentContainer } from "@/components/admin/ContentContainer";
import { TabContainer } from "@/components/admin/TabContainer";
import { FormField, FormInput, FormSelect, FormLabel } from "@/components/admin/FormComponents";
import { SectionContainer } from "@/components/admin/SectionContainer";
import { TestTypeSpecificFields } from "@/components/admin/TestTypeSpecificFields";
import { SelectedQuestionsList } from "@/components/admin/SelectedQuestionsList";

const CreateTestPage = () => {
  const [activeTab, setActiveTab] = useState<TestType>("assessment");
  const [testTitle, setTestTitle] = useState("");
  const [testTime, setTestTime] = useState(60); // Default to 60 minutes
  const [showUsedQuestions, setShowUsedQuestions] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<
    SelectedQuestion[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [questionTypeTab, setQuestionTypeTab] = useState<
    "normal" | "comprehensive"
  >("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitedUserEmail, setInvitedUserEmail] = useState("");
  // Default to marking questions as used in practice tests
  const [markQuestionsAsUsed, setMarkQuestionsAsUsed] = useState(activeTab === "practice");

  // Update markQuestionsAsUsed when tab changes
  useEffect(() => {
    setMarkQuestionsAsUsed(activeTab === "practice");
  }, [activeTab]);

  // Test category filters - these are separate from question pool filters
  const [testCategory, setTestCategory] = useState("");
  const [testSubCategory, setTestSubCategory] = useState("");

  // Calculate how many questions would be included with current test filters
  const getFilteredQuestionCount = () => {
    if (!testCategory && !testSubCategory) {
      return selectedQuestions.length;
    }

    return selectedQuestions.filter((question) => {
      // Check if question matches test filters
      if (testCategory && question.category !== testCategory) {
        return false;
      }
      if (testSubCategory && question.subCategory !== testSubCategory) {
        return false;
      }
      return true;
    }).length;
  };

  const {
    questions: allQuestions,
    comprehensiveQuestions: allComprehensiveQuestions,
    loading,
    categories,
    subCategories,
  } = useQuestions({
    searchTerm,
    category,
    subCategory,
    includeComprehensive: true,
  });

  // Filter questions based on usedForPracticeTest status
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      if (activeTab === "practice" && !showUsedQuestions && q.usedForPracticeTest) {
        return false;
      }
      return true;
    });
  }, [allQuestions, activeTab, showUsedQuestions]);

  const filteredComprehensiveQuestions = useMemo(() => {
    return allComprehensiveQuestions.filter(q => {
      if (activeTab === "practice" && !showUsedQuestions && 
          q.questions.some(subQ => subQ.usedForPracticeTest)) {
        return false;
      }
      return true;
    });
  }, [allComprehensiveQuestions, activeTab, showUsedQuestions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSelectedQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addQuestion = (question: SelectedQuestion) => {
    if (!selectedQuestions.find((q) => q.id === question.id)) {
      setSelectedQuestions([...selectedQuestions, question]);
      toast.success(`"${question.title}" added to the test.`);
    } else {
      toast.warning(`"${question.title}" is already in the test.`);
    }
  };

  const removeQuestion = (questionId: string) => {
    const questionToRemove = selectedQuestions.find((q) => q.id === questionId);
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== questionId));
    if (questionToRemove) {
      toast.error(`"${questionToRemove.title}" removed from the test.`);
    }
  };

  const addRandomQuestions = (count: number) => {
    const availableQuestions = filteredQuestions.filter(
      (q) => !selectedQuestions.find((sq) => sq.id === q.id)
    );
    const numToAdd = Math.min(count, availableQuestions.length);
    if (numToAdd === 0) {
      toast.info("No more unique questions to add from the current filter.");
      return;
    }
    const randomQuestions = availableQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, numToAdd);
    setSelectedQuestions([...selectedQuestions, ...randomQuestions]);
    toast.success(`Added ${numToAdd} random questions.`);
  };

  const handleCreateTest = async () => {
    if (!testTitle.trim()) {
      toast.error("Test title is required.");
      return;
    }
    if (testTime <= 0) {
      toast.error("Test duration must be greater than 0.");
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error("A test must have at least one question.");
      return;
    }

    // Check if any questions will remain after applying test category filters
    const filteredQuestionCount = getFilteredQuestionCount();
    if (filteredQuestionCount === 0 && (testCategory || testSubCategory)) {
      toast.error(`No questions match the selected test filters. Please adjust your category/subcategory filters or add matching questions.`);
      return;
    }
    if (activeTab === "live" && (!startsAt || !endsAt)) {
      toast.error("Start and End times are required for Live tests.");
      return;
    }

    // For practice tests, always warn if we're NOT marking questions as used
    if (activeTab === "practice" && !markQuestionsAsUsed) {
      const shouldMark = window.confirm(
        "Are you sure you don't want to mark these questions as used? Marking them helps prevent question repetition in future practice tests."
      );
      // If they want to mark questions as used, update the state and continue
      if (!shouldMark) {
        setMarkQuestionsAsUsed(true);
      }
    }

    setIsSubmitting(true);

    const orderedQuestions: OrderedQuestion[] = selectedQuestions.map((q) => ({
      id: q.id!,
      type: "questions" in q ? "comprehensive" : "question",
    }));

    const testData: Partial<
      Test & { startsAt?: Date; endsAt?: Date; invitedUser?: string }
    > = {
      title: testTitle,
      time: testTime * 60, // Convert minutes to seconds
      orderedQuestions,
    };

    // Add category and subcategory filters if specified
    if (testCategory) {
      testData.category = testCategory;
    }
    if (testSubCategory) {
      testData.subCategory = testSubCategory;
    }

    if (activeTab === "live") {
      testData.startsAt = new Date(startsAt);
      testData.endsAt = new Date(endsAt);
    }

    if (activeTab === "challenge") {
      // You would typically get the invited user's ID from a search/selection UI
      // For now, we'll leave it as a placeholder.
      // testData.invitedUser = invitedUserEmail;
    }

    try {
      const response = await createTest(activeTab, testData);
      if (response.success) {
        // If this is a practice test and markQuestionsAsUsed is true, update the questions
        if (activeTab === "practice" && markQuestionsAsUsed) {
          const updatePromises = selectedQuestions.map(async (question) => {
            if ('questions' in question) {
              // For comprehensive questions, update each sub-question
              return Promise.all(question.questions.map(q => 
                updateQuestion(q.id!, { usedForPracticeTest: true })
              ));
            } else {
              // For regular questions
              return updateQuestion(question.id!, { usedForPracticeTest: true });
            }
          });
          await Promise.all(updatePromises);
        }

        toast.success(`Test "${testTitle}" created successfully!`);
        // Reset state
        setTestTitle("");
        setTestTime(60);
        setSelectedQuestions([]);
        setStartsAt("");
        setEndsAt("");
        setTestCategory("");
        setTestSubCategory("");
        setMarkQuestionsAsUsed(false);
      } else {
        throw new Error(response.error || "Failed to create test");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageLayout>
      {/* Header */}
      <PageHeader
        title="Test Creation Center"
        description="Build, customize, and launch tests for your students."
      >
        {activeTab === "practice" && (
          <div className="mt-4 p-3 bg-tathir-beige rounded-lg border border-tathir-maroon">
            <h3 className="text-tathir-dark-green font-semibold mb-1">Practice Test Mode</h3>
            <p className="text-sm text-tathir-maroon">
              Questions can be marked as "used" to prevent repetition in future practice tests. 
              This helps ensure students encounter fresh questions in each practice session.
            </p>
          </div>
        )}
      </PageHeader>

      {/* Tabs */}
      <TabContainer
        tabs={[
          { id: "assessment", label: "Assessment Test" },
          { id: "live", label: "Live Test" },
          { id: "practice", label: "Practice Test" },
          { id: "challenge", label: "Challenge Test" }
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TestType)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Question Pool */}
        <ContentContainer title="Question Pool">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-tathir-dark-green">
              {questionTypeTab === "normal" ? (
                <span>
                  Showing {filteredQuestions.length} of {allQuestions.length} questions
                  {activeTab === "practice" && !showUsedQuestions && 
                    ` (${allQuestions.length - filteredQuestions.length} used)`}
                </span>
              ) : (
                <span>
                  Showing {filteredComprehensiveQuestions.length} of {allComprehensiveQuestions.length} comprehensive sets
                  {activeTab === "practice" && !showUsedQuestions &&
                    ` (${allComprehensiveQuestions.length - filteredComprehensiveQuestions.length} used)`}
                </span>
              )}
            </div>
          </div>
          <SectionContainer>
            {/* Search and Type Selection */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <FormInput
                  type="text"
                  placeholder="Search questions..."
                  variant="light"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
                <div className="flex gap-2">
                  <Button
                    variant={questionTypeTab === "normal" ? "primary" : "secondary"}
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setQuestionTypeTab("normal")}
                  >
                    Normal ({filteredQuestions.length})
                  </Button>
                  <Button
                    variant={questionTypeTab === "comprehensive" ? "primary" : "secondary"}
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => setQuestionTypeTab("comprehensive")}
                  >
                    Comprehensive ({filteredComprehensiveQuestions.length})
                  </Button>
                </div>
              </div>

            {/* Category Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <FormLabel variant="light">Category</FormLabel>
                <FormSelect
                  variant="light"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubCategory("");
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </FormSelect>
              </div>
              <div>
                <FormLabel variant="light">Sub-category</FormLabel>
                <FormSelect
                  variant="light"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  disabled={!category}
                  className="disabled:opacity-50"
                >
                  <option value="">All Sub-categories</option>
                  {subCategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </FormSelect>
              </div>
            </div>

              {/* Practice Test Controls */}
              {activeTab === "practice" && (
                <div className="mt-4 pt-4 border-t border-tathir-brown/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tathir-dark-green font-medium">Question Usage</span>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setShowUsedQuestions(!showUsedQuestions)}
                        variant={showUsedQuestions ? "warning" : "secondary"}
                        size="sm"
                      >
                        {showUsedQuestions ?  'Hide Used Questions':'Show All Questions' }
                      </Button>
                      <Button
                        onClick={() => setMarkQuestionsAsUsed(!markQuestionsAsUsed)}
                        variant={markQuestionsAsUsed ? "primary" : "secondary"}
                        size="sm"
                      >
                        {markQuestionsAsUsed ? 'Will Mark as Used' : 'Won\'t Mark as Used'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
          </SectionContainer>
          
          <div className="flex justify-end mb-4">
            <Button
              variant="success"
              size="sm"
              onClick={() => addRandomQuestions(5)}
              icon={<FaRandom />}
            >
              Add 5 Random Questions
            </Button>
          </div>

          <div className="bg-tathir-beige p-3 rounded-lg min-h-[300px] max-h-[500px] overflow-y-auto border-2 border-tathir-brown">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <FaSpinner className="animate-spin text-2xl text-tathir-dark-green" />
                </div>
              ) : (
                <ul>
                  {(questionTypeTab === "normal"
                    ? filteredQuestions
                    : filteredComprehensiveQuestions
                  ).map((q) => (
                    <li
                      key={q.id}
                      className={`flex justify-between items-center p-3 rounded-lg mb-2 shadow-sm transition-all border ${
                        'usedForPracticeTest' in q && q.usedForPracticeTest
                          ? 'bg-tathir-beige border-tathir-maroon/50'
                          : 'bg-white border-tathir-brown hover:bg-tathir-beige'
                      }`}
                    >
                      <div className="flex-1 pr-4">
                        <p className="text-sm text-tathir-dark-green font-medium">
                          {q.title}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-tathir-dark-green/10 text-tathir-dark-green rounded-full border border-tathir-dark-green/20">
                            {q.category}
                          </span>
                          {q.subCategory && (
                            <span className="text-xs px-2 py-0.5 bg-tathir-maroon/10 text-tathir-maroon rounded-full border border-tathir-maroon/20">
                              {q.subCategory}
                            </span>
                          )}
                          {'usedForPracticeTest' in q && q.usedForPracticeTest && (
                            <span className="text-xs px-2 py-0.5 bg-tathir-maroon/15 text-tathir-maroon rounded-full flex items-center gap-1 border border-tathir-maroon/30">
                              Used in Practice
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => addQuestion(q)}
                        icon={<FaPlus />}
                      >
                        Add
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
        </ContentContainer>

        {/* Right Column: Test Builder */}
        <ContentContainer className="bg-tathir-dark-green shadow-xl border-tathir-maroon" title="Test Builder">
          <div className="space-y-4">
            <FormField label="Test Title">
              <FormInput
                type="text"
                placeholder="e.g., Weekly Physics Challenge"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
            </FormField>
            
            <FormField label="Test Duration (minutes)">
              <FormInput
                type="number"
                placeholder="e.g., 60"
                value={testTime}
                onChange={(e) => setTestTime(Number(e.target.value))}
              />
            </FormField>

            {/* Test Category Filters */}
            <FormField 
              label="Test Category Filters"
              labelAlt="Optional: Limit test to specific categories"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormSelect
                  value={testCategory}
                  onChange={(e) => {
                    setTestCategory(e.target.value);
                    setTestSubCategory("");
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </FormSelect>
                <FormSelect
                  value={testSubCategory}
                  onChange={(e) => setTestSubCategory(e.target.value)}
                  disabled={!testCategory}
                  className="disabled:opacity-50"
                >
                  <option value="">All Sub-categories</option>
                  {subCategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </FormField>
                {(testCategory || testSubCategory) && (
                  <div className="text-xs text-tathir-light-green">
                    <span className="font-semibold">Filter Active:</span> Only
                    questions from{" "}
                    {testCategory && (
                      <span className="bg-tathir-maroon text-tathir-cream px-2 py-1 rounded-full text-xs">
                        {testCategory}
                      </span>
                    )}
                    {testSubCategory && (
                      <>
                        {testCategory && " → "}
                        <span className="bg-tathir-brown text-tathir-cream px-2 py-1 rounded-full text-xs">
                          {testSubCategory}
                        </span>
                      </>
                    )}{" "}
                    will be included in this test.
                    <br />
                    <span className="font-semibold">Preview:</span> {getFilteredQuestionCount()} of {selectedQuestions.length} selected questions will be included.
                    {getFilteredQuestionCount() === 0 && (
                      <span className="text-red-400 font-bold"> ⚠️ No questions match these filters!</span>
                    )}
                  </div>
                )}
              </div>

              <TestTypeSpecificFields
                testType={activeTab}
                startsAt={startsAt}
                endsAt={endsAt}
                onStartsAtChange={setStartsAt}
                onEndsAtChange={setEndsAt}
                invitedUserEmail={invitedUserEmail}
                onInvitedUserEmailChange={setInvitedUserEmail}
              />

              <SelectedQuestionsList
                selectedQuestions={selectedQuestions}
                testCategory={testCategory}
                testSubCategory={testSubCategory}
                onDragEnd={handleDragEnd}
                onRemove={removeQuestion}
                getFilteredQuestionCount={getFilteredQuestionCount}
              />              <Button
                variant="success"
                size="lg"
                onClick={handleCreateTest}
                disabled={isSubmitting}
                fullWidth
                className="mt-4"
                icon={isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
              >
                {isSubmitting ? "Creating..." : `Create ${activeTab} Test`}
              </Button>
        </ContentContainer>
      </div>
    </AdminPageLayout>
  );
};

export default CreateTestPage;
