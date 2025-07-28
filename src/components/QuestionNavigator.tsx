import { QuestionWithTimer } from "@/lib/apis/questions";

interface QuestionNavigatorProps {
  questions: QuestionWithTimer[];
  currentQuestionIndex: number;
  handleJumpToQuestion: (index: number) => void;
  isDisabled?: boolean;
}

export default function QuestionNavigator({
  questions,
  currentQuestionIndex,
  handleJumpToQuestion,
  isDisabled = false,
}: QuestionNavigatorProps) {
  return (
    <nav className={`flex overflow-x-auto space-x-2 flex-wrap ${isDisabled ? 'opacity-70' : ''}`}>
      {questions.map((q, index) => (
        <button
          key={index}
          onClick={() => handleJumpToQuestion(index)}
          className={`px-3 py-1 m-1 mb-4 rounded-lg focus:outline-none focus:ring-2 hover:scale-125 transition-all ease-in-out duration-300 ${
            currentQuestionIndex === index
              ? "bg-tathir-dark-green text-tathir-beige"
              : q.selected !== null
              ? "bg-warning text-tathir-maroon"
              : "bg-tathir-beige text-tathir-maroon"
          } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          aria-label={`Question ${index + 1}`}
          disabled={isDisabled}
        >
          {index + 1}
        </button>
      ))}
    </nav>
  );
} 