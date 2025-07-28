"use client";

import React from 'react';
import { 
  DndContext, 
  closestCenter, 
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaGripVertical, FaTrash } from 'react-icons/fa';
import { Button } from '@/components/shared/ui/Button';
import { bloxat } from '@/components/fonts';

interface SortableItemProps {
  question: any;
  onRemove: (id: string) => void;
  isIncludedInTest?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ question, onRemove, isIncludedInTest = true }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center p-3 rounded-lg shadow-sm border transition-all ${
        isIncludedInTest 
          ? "bg-white border-tathir-brown hover:bg-tathir-beige" 
          : "bg-tathir-beige border-tathir-brown opacity-75"
      } ${
        'usedForPracticeTest' in question && question.usedForPracticeTest
          ? 'border-tathir-maroon'
          : ''
      }`}
    >
      <FaGripVertical className="text-tathir-brown mr-3" />
      <div className="flex-1">
        <span className={`text-sm flex-1 ${isIncludedInTest ? "text-tathir-dark-green" : "text-tathir-maroon line-through"}`}>
          {question.title}
        </span>
        <div className="flex gap-2 mt-1 flex-wrap">
          {!isIncludedInTest && (
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200">
              Filtered Out
            </span>
          )}
          {'usedForPracticeTest' in question && question.usedForPracticeTest && (
            <span className="text-xs px-2 py-0.5 bg-tathir-maroon/10 text-tathir-maroon rounded-full border border-tathir-maroon/20">
              Previously Used
            </span>
          )}
        </div>
      </div>
      <Button
        variant="error"
        size="sm"
        icon={<FaTrash />}
        onClick={() => onRemove(question.id!)}
        className="ml-2"
      >
        {/* Icon only button */}
      </Button>
    </li>
  );
};

interface SelectedQuestionsListProps {
  selectedQuestions: any[];
  testCategory?: string;
  testSubCategory?: string;
  onDragEnd: (event: DragEndEvent) => void;
  onRemove: (id: string) => void;
  getFilteredQuestionCount: () => number;
}

export const SelectedQuestionsList: React.FC<SelectedQuestionsListProps> = ({
  selectedQuestions,
  testCategory,
  testSubCategory,
  onDragEnd,
  onRemove,
  getFilteredQuestionCount
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <>
      <h3 className={`text-lg font-bold text-tathir-cream mt-4 ${bloxat.className}`}>
        Selected Questions ({selectedQuestions.length})
        {(testCategory || testSubCategory) && (
          <span className="text-sm text-tathir-light-green ml-2">
            → {getFilteredQuestionCount()} will be included in test
          </span>
        )}
      </h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={selectedQuestions.map((q) => q.id!)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="bg-tathir-beige p-3 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto space-y-2 border-2 border-tathir-brown">
            {selectedQuestions.map((q) => {
              // Check if this question will be included based on test filters
              const isIncludedInTest = !testCategory && !testSubCategory ? true : (
                (!testCategory || q.category === testCategory) &&
                (!testSubCategory || q.subCategory === testSubCategory)
              );

              return (
                <SortableItem
                  key={q.id}
                  question={q}
                  onRemove={onRemove}
                  isIncludedInTest={isIncludedInTest}
                />
              );
            })}
            {selectedQuestions.length === 0 && (
              <p className="text-center text-tathir-maroon p-4 font-medium">
                Add questions from the pool to build your test
              </p>
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
};
