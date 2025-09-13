import type { MultiLangText } from "@/lib/type";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  XCircle,
} from "lucide-react";

import { Card } from "../ui/card";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define the status type to match the store
type QuestionStatusType = "solved" | "later" | "skipped";

// Create our own getStatusColor function since the original isn't available
const getStatusColor = (status: QuestionStatusType | undefined) => {
  switch (status) {
    case "solved":
      return "bg-green-100 text-green-700 dark:bg-green-600/30 dark:text-green-300";
    case "later":
      return "bg-blue-100 text-blue-700 dark:bg-blue-600/30 dark:text-blue-300";
    case "skipped":
      return "bg-red-100 text-red-700 dark:bg-red-600/30 dark:text-red-300";
    default:
      return "text-dual-muted";
  }
};

interface QuestionNavigationProps {
  questions: {
    id: string;
    text: MultiLangText;
    options: MultiLangText[];
  }[];
  currentQuestion: number;
  questionStatus: Record<string, QuestionStatusType>;
  selectedLanguage: string | null;
  showNumbers: boolean;
  toggleShowNumbers: () => void;
  onQuestionSelect: (index: number) => void;
}

export const QuestionNavigation = ({
  questions,
  currentQuestion,
  questionStatus,
  selectedLanguage,
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
          <span className="text-dual-muted">Question Numbers</span>
          {showNumbers ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {/* Legend */}
        <Card
          className={cn(
            "space-y-2 mb-10 p-4 rounded-xl border text-dual-muted",
            !showNumbers && "lg:block hidden",
          )}
        >
          <div className="flex items-center gap-2 ">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium ">Solved questions</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium ">Questions for later</span>
          </div>

          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium ">Skipped questions</span>
          </div>
        </Card>

        {/* Question Numbers Grid */}
        <div
          className={cn(
            "grid grid-cols-5 lg:grid-cols-5 gap-4 lg:gap-2 p-1 overflow-y-auto no-scrollbar max-h-[40vh]",
            !showNumbers && "lg:grid hidden",
          )}
        >
          {questions.map((question, idx) => {
            // Use question.id to get the status
            const status = questionStatus[question.id];
            const isCurrent = idx === currentQuestion;

            return (
              <Button
                key={question.id}
                className={cn(
                  "w-9 h-9 font-bold",
                  "border border-border",
                  "text-red-500 hover:text-accent-foreground",
                  "focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  getStatusColor(status),
                  isCurrent && "ring-2 ring-white", // Always apply ring for current question
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
