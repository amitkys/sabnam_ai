import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import "katex/dist/katex.min.css";
// eslint-disable-next-line import/order
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// eslint-disable-next-line import/order
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { geist } from "@/config/fonts";

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
  console.log(currentNumber);

  return (
    <Card className="bg-transparent border p-6 dark:border-gray-700">
      {/* Question Header - Question number and text */}
      <div className="flex mb-2">
        <span className="text-muted-foreground mr-2 mt-0.5 text-sm flex-shrink-0">
          {currentNumber}/{totalQuestions}.
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-base lg:text-lg font-bold">
            <Markdown
              components={{
                code({
                  node,
                  inline,
                  className,
                  children,
                  ...props
                }: {
                  node?: any;
                  inline?: boolean;
                  className?: string;
                  children?: React.ReactNode;
                  [key: string]: any;
                }) {
                  const match = /language-(\w+)/.exec(className || "");

                  return !inline && match ? (
                    // Code block wrapper with horizontal scroll only for questions
                    <div
                      className={`my-2 ${geist.className}  overflow-x-auto scrollbar-hide text-xs md:text-base`}
                    >
                      <SyntaxHighlighter
                        PreTag="div"
                        codeTagProps={{}}
                        customStyle={{
                          margin: 0,
                          borderRadius: "0.5rem",
                          whiteSpace: "pre",
                          display: "inline-block",
                          minWidth: "fit-content",
                          maxWidth: "100%",
                        }}
                        language={match[1]}
                        style={oneDark}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    // Inline code with responsive text wrapping
                    <code
                      className="bg-muted px-1 py-0.5 rounded break-words"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
              rehypePlugins={[rehypeKatex]}
              remarkPlugins={[remarkMath]}
            >
              {question.text}
            </Markdown>
          </h2>
        </div>
      </div>

      {/* Answer Options - Radio group with selectable options */}
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

              {/* Option text with responsive markdown rendering */}
              <div className="flex-1 min-w-0">
                <Markdown
                  components={{
                    code({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: {
                      node?: any;
                      inline?: boolean;
                      className?: string;
                      children?: React.ReactNode;
                      [key: string]: any;
                    }) {
                      const match = /language-(\w+)/.exec(className || "");

                      return !inline && match ? (
                        // Code block in options - no horizontal scroll, wraps text
                        <div className="mt-2 inline-block text-xs">
                          <SyntaxHighlighter
                            PreTag="div"
                            codeTagProps={{}}
                            customStyle={{
                              margin: 0,
                              borderRadius: "0.375rem",
                              fontSize: "0.75rem",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              display: "inline-block",
                              minWidth: "fit-content",
                              maxWidth: "100%",
                            }}
                            language={match[1]}
                            style={oneDark}
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        // Inline code in options with word breaking
                        <code
                          className="bg-muted px-1 py-0.5 rounded text-xs break-words"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                  rehypePlugins={[rehypeKatex]}
                  remarkPlugins={[remarkMath]}
                >
                  {option.text}
                </Markdown>
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </Card>
  );
};
