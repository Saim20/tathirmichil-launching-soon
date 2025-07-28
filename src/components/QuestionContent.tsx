import { QuestionWithTimer } from "@/lib/apis/questions";
import { useState, useEffect } from "react";
import { processContent } from "@/lib/utils/contentProcessor";

interface QuestionContentProps {
  question: QuestionWithTimer;
  handleOptionSelect: (optionIndex: number) => void;
  isDisabled?: boolean;
}

export default function QuestionContent({
  question,
  handleOptionSelect,
  isDisabled = false,
}: QuestionContentProps) {
  const [processedTitle, setProcessedTitle] = useState<string>("");
  const [processedOptions, setProcessedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processQuestionContent = async () => {
      setIsLoading(true);
      try {
        // Process the question title
        const htmlTitle = await processContent(question.title);
        setProcessedTitle(htmlTitle);

        // Process all options
        const htmlOptions = await Promise.all(
          question.options.map(option => processContent(option))
        );
        setProcessedOptions(htmlOptions);
      } catch (error) {
        console.error("Error processing question content:", error);
        // Fallback to original content
        setProcessedTitle(question.title);
        setProcessedOptions(question.options);
      } finally {
        setIsLoading(false);
      }
    };

    processQuestionContent();
  }, [question.title, question.options]);

  if (isLoading) {
    return (
      <section className={`question-container bg-tathir-dark-green shadow-md rounded-lg p-3 sm:p-6 ${isDisabled ? 'opacity-70' : ''}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-tathir-beige/20 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-tathir-beige/10 rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`question-container bg-tathir-dark-green shadow-md rounded-lg p-3 sm:p-6 ${isDisabled ? 'opacity-70' : ''}`}>
      {/* Question Title with HTML/Markdown support */}
      <div className="text-lg font-semibold mb-4 text-tathir-beige">
        <div 
          dangerouslySetInnerHTML={{ __html: processedTitle }}
          className="prose prose-invert max-w-none [&>*]:text-tathir-beige [&_strong]:text-tathir-cream [&_em]:text-tathir-cream [&_code]:bg-tathir-maroon/20 [&_code]:text-tathir-cream [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-tathir-maroon/20 [&_pre]:text-tathir-cream [&_pre]:p-3 [&_pre]:rounded [&_blockquote]:border-l-4 [&_blockquote]:border-tathir-cream [&_blockquote]:pl-4 [&_blockquote]:text-tathir-cream/90 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
        />
      </div>

      {/* Question Image (if exists) */}
      {question.imageUrl && (
        <div className="mb-4">
          <img 
            src={question.imageUrl} 
            alt="Question illustration"
            className="max-w-full h-auto rounded-lg shadow-md border border-tathir-beige/20"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
            onError={(e) => {
              console.error("Failed to load question image:", question.imageUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Options with HTML/Markdown support */}
      <ul className="space-y-2">
        {processedOptions.map((processedOption, index) => (
          <li
            key={index}
            className={`p-3 border rounded-lg transition-all ease-in-out duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              question.selected === index
                ? "bg-warning text-tathir-maroon hover:scale-105"
                : "bg-tathir-beige text-tathir-maroon hover:scale-105"
            } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            onClick={() => {
              if (!isDisabled && index !== question.selected) {
                handleOptionSelect(index);
              }
            }}
            aria-label={`Option ${index + 1}`}
            role="button"
            aria-disabled={isDisabled}
            tabIndex={isDisabled ? -1 : 0}
          >
            <div 
              dangerouslySetInnerHTML={{ __html: processedOption }}
              className="prose max-w-none [&>*]:text-current [&_strong]:font-bold [&_em]:italic [&_code]:bg-black/10 [&_code]:text-current [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-black/10 [&_pre]:text-current [&_pre]:p-2 [&_pre]:rounded [&_blockquote]:border-l-4 [&_blockquote]:border-current [&_blockquote]:pl-3 [&_blockquote]:opacity-80 [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-4"
            />
          </li>
        ))}
      </ul>
    </section>
  );
} 