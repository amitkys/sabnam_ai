import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define the status type to match the store
type QuestionStatusType = "solved" | "later" | "skipped";

// Create our own getStatusColor function since the original isn't available
const getStatusColor = (status: QuestionStatusType | undefined) => {
  switch (status) {
    case "solved":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "later":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "skipped":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-background text-foreground";
  }
};

interface QuestionNavigationProps {
  questions: {
    id: string;
    text: string;
    answer: string;
    options: {
      id: string;
      text: string;
    }[];
  }[];
  currentQuestion: number;
  questionStatus: Record<string, QuestionStatusType>;
  showNumbers: boolean;
  toggleShowNumbers: () => void;
  onQuestionSelect: (index: number) => void;
}

export const QuestionNavigation = ({
  questions,
  currentQuestion,
  questionStatus,
  showNumbers,
  toggleShowNumbers,
  onQuestionSelect,
}: QuestionNavigationProps) => {
  return (
    <div className="w-full lg:w-auto">
      <div className="lg:w-[280px]">
        {/* Mobile Toggle */}
        <button
          className="w-full flex items-center justify-between lg:hidden mb-2 p-2 border border-border rounded"
          onClick={toggleShowNumbers}
        >
          <span>Question Numbers</span>
          {showNumbers ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Legend */}
        <div
          className={cn(
            "space-y-1 mb-10 p-3 rounded-lg bg-muted",
            !showNumbers && "lg:block hidden",
          )}
        >
          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                fillRule="evenodd"
              />
            </svg>
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
              Solved questions
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                fillRule="evenodd"
              />
            </svg>
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              Questions for later
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                fillRule="evenodd"
              />
            </svg>
            <span className="text-red-600 dark:text-red-400 text-sm font-medium">
              Skipped questions
            </span>
          </div>
        </div>

        {/* Question Numbers Grid */}
        <div
          className={cn(
            "grid grid-cols-5 lg:grid-cols-5 gap-4 lg:gap-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-2 p-1",
            !showNumbers && "lg:grid hidden",
          )}
        >
          {questions.map((question, idx) => {
            // Use question.id instead of idx to get the status
            const status = questionStatus[question.id];
            const isCurrent = idx === currentQuestion;

            return (
              <Button
                key={idx}
                className={cn(
                  "w-8 h-8 lg:w-9 lg:h-9 rounded-full",
                  "border border-border",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  getStatusColor(status),
                  isCurrent && !status && "ring-2 ring-white",
                )}
                variant="outline"
                onClick={() => onQuestionSelect(idx)}
              >
                {idx + 1}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
