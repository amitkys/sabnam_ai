"use client";

import { CheckCircle2, XCircle, MinusCircle, ExternalLink } from "lucide-react";

import { QuestionCardProps } from "./types";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/newMarkdownRender";
import { reduceHeader } from "@/utils/utils";
import { OptionCard } from "@/components/analysis/OptionsCard";

export function QuestionCard({
  question,
  index,
  userAnswer,
  onExplainClick,
  isLastQuestion,
}: QuestionCardProps) {
  const handleChatGPTRedirect = () => {
    const promptText = `Question: ${question.text}

Options:
${question.options.map((option, idx) => `${idx + 1}. ${option.text}`).join("\n")}

My Answer: ${userAnswer?.userAnswer || "<no answer given by user>"}
Correct Answer: ${question.correctAnswer || ""}

Solve & Compare my answer with the actual correct answer. If no answer is given in the 'My Answer' field, clearly state that I did not answer the question. At the end, provide a clear conclusion about which answer is correct and which is incorrect. The response should be in the same language as the question.`;

    // URL encode the prompt
    const encodedPrompt = encodeURIComponent(promptText);

    // Create the ChatGPT URL with the prompt parameter
    const chatgptUrl = `https://chatgpt.com/?prompt=${encodedPrompt}&intent=web`;

    window.open(chatgptUrl, "_blank");
  };

  return (
    <div className="py-4 px-2 md:px-4 border border-border rounded-lg space-y-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
            {index + 1}
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">Question</h3>
            <button
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              title="Ask ChatGPT"
              onClick={handleChatGPTRedirect}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userAnswer ? (
            <Badge
              className="h-6"
              variant={userAnswer.isCorrect ? "default" : "destructive"}
            >
              {userAnswer.isCorrect ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              {userAnswer.isCorrect ? "Correct" : "Incorrect"}
            </Badge>
          ) : (
            <Badge className="h-6" variant="secondary">
              <MinusCircle className="w-3 h-3 mr-1" />
              Unanswered
            </Badge>
          )}
        </div>
      </div>

      <div className="bg-muted/30 p-3 rounded-lg">
        <MarkdownRenderer
          className="prose-sm lg:prose-base"
          content={reduceHeader(question.text, 1)}
          variant="question"
        />
      </div>

      <div className="space-y-2">
        {question.options.map((option) => {
          const isCorrect = option.text === question.correctAnswer;
          const isUserSelected =
            userAnswer && option.text === userAnswer.userAnswer;

          return (
            <OptionCard
              key={option.id}
              isCorrect={isCorrect}
              isUserSelected={isUserSelected}
              option={option}
            />
          );
        })}
      </div>

      {!isLastQuestion && <Separator className="mt-6" />}
    </div>
  );
}
