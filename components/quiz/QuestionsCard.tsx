import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";

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
    <Card className="bg-transparent border p-6 dark:border-gray-700">
      <div className="flex mb-2">
        <span className="text-muted-foreground mr-2 mt-0.5 text-base">
          {currentNumber}/{totalQuestions}.
        </span>
        <h2 className="text-base lg:text-lg font-bold">
          <Markdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
            {question.text}
          </Markdown>
        </h2>
      </div>

      <RadioGroup
        className="space-y-3"
        value={selectedAnswer}
        onValueChange={(value) => {
          const option = question.options.find(
            (o: { text: string }) => o.text === value,
          );

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
                "transition-colors duration-200",
              )}
            >
              <RadioGroupItem id={`option-${idx}`} value={option.text} />

              <span className="flex-grow">
                <Markdown
                  rehypePlugins={[rehypeKatex]}
                  remarkPlugins={[remarkMath]}
                >
                  {option.text}
                </Markdown>
              </span>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </Card>
  );
};
