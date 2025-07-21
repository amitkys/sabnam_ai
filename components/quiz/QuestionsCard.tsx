// 1. Updated QuestionCard component
import { useTheme } from "next-themes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/newMarkdownRender"; // Your new reusable component

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  answer: string;
  options: QuestionOption[];
}

interface QuestionCardProps {
  question: Question;
  currentNumber: number;
  selectedAnswer: string;
  totalQuestions: number;
  onAnswerSelect: (optionId: string, optionText: string) => void;
}

export const QuestionCard = ({
  question,
  currentNumber,
  selectedAnswer,
  totalQuestions,
  onAnswerSelect,
}: QuestionCardProps) => {
  return (
      <Card className="bg-transparent border px-6 pb-6 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Question Header */}
        <div className="flex flex-col mb-2">
          <div className="text-muted-foreground text-sm mt-1 p-2 border-b border-border">
            <span className="bg-muted/60 px-2 py-1 rounded">
              Question {currentNumber}/{totalQuestions}.
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {/* Use the reusable markdown renderer for question text */}
            <MarkdownRenderer 
              content={question.text} 
              variant="question"
            />
          </div>
        </div>

        {/* Answer Options */}
        <RadioGroup
          className="space-y-1"
          value={selectedAnswer}
          onValueChange={(value) => {
            const option = question.options.find((o) => o.text === value);
            if (option) {
              onAnswerSelect(option.id, value);
            }
          }}
        >
          {question.options.map((option, idx) => (
            <Label
              key={option.id}
              className="w-full cursor-pointer"
              htmlFor={`option-${idx}`}
            >
              <div
                className={cn(
                  "flex items-center space-x-2 rounded-lg border border-border p-4",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-colors duration-200"
                )}
              >
                <RadioGroupItem id={`option-${idx}`} value={option.text} />
                <div className="flex-1 min-w-0">
                  {/* Use the reusable markdown renderer for option text */}
                  <MarkdownRenderer 
                    content={option.text} 
                    variant="option"
                  />
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </Card>
  );
};