import type { MultiLangText } from "@/lib/type";

import { Badge } from "../ui/badge";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/newMarkdownRender";

interface Question {
  id: string;
  text: MultiLangText;
  options: MultiLangText[];
  tags?: string[] | undefined;
}

interface QuestionCardProps {
  question: Question;
  currentNumber: number;
  selectedLanguage: string | null;
  selectedOptionIndex: number | undefined;
  totalQuestions: number;
  onAnswerSelect: (optionIndex: number) => void;
}

export const QuestionCard = ({
  question,
  currentNumber,
  selectedLanguage,
  selectedOptionIndex,
  totalQuestions,
  onAnswerSelect,
}: QuestionCardProps) => {
  // Helper function to get text in selected language
  const getLocalizedText = (text: MultiLangText): string => {
    if (!selectedLanguage) return String(text["en"] || "");

    // Handle case where language might be capitalized (e.g., 'English', 'Hindi')
    const langKey = selectedLanguage.slice(0, 2).toLowerCase();

    // Try to get the text in the selected language, fallback to English
    return String(text[langKey] || text["en"]);
  };

  return (
    <Card
      className="bg-transparent border px-6 pb-6 overflow-y-auto no-scrollbar"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      {/* Question Header */}
      <div className="flex flex-col mb-2">
        <div className="flex justify-between text-muted-foreground text-sm mt-1 p-2 border-b border-border">
          <span className="bg-muted/60 px-2 py-1 rounded">
            Qn. {currentNumber}/{totalQuestions}
          </span>
          {question.tags?.length ? (
            <Badge variant="outline">{question.tags.join(", ")}</Badge>
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          {/* Use the reusable markdown renderer for question text */}
          <MarkdownRenderer
            content={getLocalizedText(question.text)}
            variant="question"
          />
        </div>
      </div>

      {/* Answer Options */}
      <RadioGroup
        className="space-y-1"
        value={selectedOptionIndex?.toString() || ""}
        onValueChange={(value) => {
          const optionIndex = parseInt(value);

          onAnswerSelect(optionIndex);
        }}
      >
        {question.options.map((option, idx) => (
          <Label
            key={idx}
            className="w-full cursor-pointer"
            htmlFor={`option-${idx}`}
          >
            <div
              className={cn(
                "flex items-center space-x-2 rounded-lg border border-border p-4",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors duration-200",
                selectedOptionIndex === idx &&
                "bg-accent text-accent-foreground",
              )}
            >
              <RadioGroupItem id={`option-${idx}`} value={idx.toString()} />
              <div className="flex-1 min-w-0">
                {/* Use the reusable markdown renderer for option text */}
                <MarkdownRenderer
                  content={getLocalizedText(option)}
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
