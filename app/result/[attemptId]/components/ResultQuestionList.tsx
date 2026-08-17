"use client";

import React, { useState, useRef, useEffect } from "react";
import { IResultData, IResultQuestion } from "@/hooks/query/get/use-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedGroup } from "@/components/ui/animated-group";

interface ResultQuestionListProps {
  data: IResultData;
}

export const ResultQuestionList: React.FC<ResultQuestionListProps> = ({ data }) => {
  const [filter, setFilter] = useState<"ALL" | "CORRECT" | "INCORRECT" | "SKIPPED">("ALL");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredQuestions = data.questions.filter((q) => {
    if (filter === "ALL") return true;
    if (filter === "CORRECT") return q.studentResponse && q.studentResponse.isCorrect;
    if (filter === "INCORRECT") return q.studentResponse && !q.studentResponse.isCorrect;
    if (filter === "SKIPPED") return !q.studentResponse;
    return true;
  });

  const getFilterCounts = () => {
    return {
      all: data.questions.length,
      correct: data.questions.filter((q) => q.studentResponse?.isCorrect).length,
      incorrect: data.questions.filter((q) => q.studentResponse && !q.studentResponse.isCorrect).length,
      skipped: data.questions.filter((q) => !q.studentResponse).length,
    };
  };

  const filterCounts = getFilterCounts();

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Filter Questions</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "ALL" ? "default" : "outline"}
            onClick={() => setFilter("ALL")}
            className="transition-all duration-200 hover:scale-105"
            aria-label={`Show all questions (${filterCounts.all} questions)`}
          >
            All ({filterCounts.all})
          </Button>
          <Button
            variant={filter === "CORRECT" ? "default" : "outline"}
            onClick={() => setFilter("CORRECT")}
            className="transition-all duration-200 hover:scale-105"
            aria-label={`Show correct questions (${filterCounts.correct} questions)`}
          >
            <span className="text-green-600 mr-1">●</span>
            Correct ({filterCounts.correct})
          </Button>
          <Button
            variant={filter === "INCORRECT" ? "default" : "outline"}
            onClick={() => setFilter("INCORRECT")}
            className="transition-all duration-200 hover:scale-105"
            aria-label={`Show incorrect questions (${filterCounts.incorrect} questions)`}
          >
            <span className="text-red-600 mr-1">●</span>
            Incorrect ({filterCounts.incorrect})
          </Button>
          <Button
            variant={filter === "SKIPPED" ? "default" : "outline"}
            onClick={() => setFilter("SKIPPED")}
            className="transition-all duration-200 hover:scale-105"
            aria-label={`Show skipped questions (${filterCounts.skipped} questions)`}
          >
            <span className="text-gray-500 mr-1">●</span>
            Skipped ({filterCounts.skipped})
          </Button>
        </div>
      </div>

      <AnimatedGroup
        preset="blur-slide"
        className="space-y-4"
      >
        {filteredQuestions.map((q) => (
          <QuestionReviewCard 
            key={q.id} 
            q={q} 
            language={data.attempt.language}
            isExpanded={expandedQuestion === q.id}
            onToggleExpand={() => setExpandedQuestion(
              expandedQuestion === q.id ? null : q.id
            )}
          />
        ))}
      </AnimatedGroup>
      {filteredQuestions.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border">
          <div className="text-muted-foreground mb-2">No questions found for this filter.</div>
          <div className="text-sm text-muted-foreground">Try selecting a different filter option.</div>
        </div>
      )}
    </div>
  );
};

const QuestionReviewCard = ({ 
  q, 
  language,
  isExpanded = false,
  onToggleExpand = () => {}
}: { 
  q: IResultQuestion, 
  language: string,
  isExpanded?: boolean,
  onToggleExpand?: () => void
}) => {
  const contentStr = q.question.content?.[language] || q.question.content?.["en"] || "No content available";
  const solutionStr = q.question.solution?.[language] || q.question.solution?.["en"] || null;
  
  const options = Array.isArray(q.question.options) ? q.question.options : [];
  
  const isSkipped = !q.studentResponse;
  const isCorrect = q.studentResponse?.isCorrect;
  const userAnswer = q.studentResponse?.userAnswer;

  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let badgeText = "Skipped";
  let borderColor = "border-l-gray-400";
  
  if (!isSkipped) {
    if (isCorrect) {
      badgeVariant = "default";
      badgeText = "Correct";
      borderColor = "border-l-green-500";
    } else {
      badgeVariant = "destructive";
      badgeText = "Incorrect";
      borderColor = "border-l-red-500";
    }
  }

  const getScoreDisplay = () => {
    if (isSkipped) return { score: "0", className: "text-gray-500", text: "Not attempted" };
    if (isCorrect) return { score: `+${q.positiveMarks}`, className: "text-green-600", text: "Correct answer" };
    return { score: `-${q.negativeMarks}`, className: "text-red-600", text: "Incorrect answer" };
  };

  const scoreDisplay = getScoreDisplay();

  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-lg border-l-4",
        borderColor,
        isExpanded && "shadow-xl"
      )}
      role="article"
      aria-labelledby={`question-${q.orderIndex}-title`}
    >
      <CardHeader 
        className="flex flex-row items-center justify-between pb-2 space-y-0 cursor-pointer"
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`question-${q.orderIndex}-content`}
        title="Click to expand/collapse question details"
      >
        <CardTitle 
          id={`question-${q.orderIndex}-title`}
          className="text-sm font-semibold flex items-center gap-2"
        >
          <span 
            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs"
            aria-label={`Question number ${q.orderIndex}`}
          >
            {q.orderIndex}
          </span>
          Question Details
        </CardTitle>
        <div className="flex gap-2 items-center">
          <Badge 
            variant={badgeVariant} 
            className="font-medium"
            aria-label={`Question status: ${badgeText}`}
          >
            {badgeText}
          </Badge>
          <Badge 
            variant="outline" 
            className={cn("font-semibold", scoreDisplay.className)}
            title={scoreDisplay.text}
          >
            {scoreDisplay.score} Marks
          </Badge>
          {!isSkipped && (
            <Badge 
              variant="secondary" 
              className="text-xs"
              aria-label={`Time taken: ${q.studentResponse?.timeTaken || 0} seconds`}
            >
              ⏱️ {q.studentResponse?.timeTaken || 0}s
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            aria-label={isExpanded ? "Collapse question details" : "Expand question details"}
            title={isExpanded ? "Collapse question details" : "Expand question details"}
          >
            <svg 
              className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent 
        id={`question-${q.orderIndex}-content`}
        role="region"
        aria-labelledby={`question-${q.orderIndex}-title`}
        className="space-y-4"
      >
        <div 
          className={cn(
            "prose dark:prose-invert max-w-none text-sm transition-all duration-300",
            !isExpanded && "line-clamp-3"
          )}
        >
          {/* Using dangerouslySetInnerHTML as placeholder for markdown rendering */}
          <div 
            dangerouslySetInnerHTML={{ __html: contentStr }} 
            aria-label="Question content"
          />
        </div>

        {isExpanded && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-muted/50 rounded-lg p-4 border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Answer Analysis
              </h4>
              
              {options.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {options.map((opt: any) => {
                    const labelSource = opt.text ?? opt.label;
                    const label =
                      labelSource?.[language] ||
                      labelSource?.en ||
                      labelSource ||
                      "";
                    const val = opt.id ?? opt.value;
                    
                    let bgClass = "bg-muted/50";
                    let borderClass = "border-border";
                    let badgeVariant: "default" | "secondary" | "outline" = "outline";
                    let badgeText = "";

                    const isOptionCorrect = val === q.question.correctValue;
                    const isOptionSelected = val === userAnswer;

                    if (isOptionCorrect) {
                      bgClass = "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                      borderClass = "border-green-500";
                      badgeVariant = "default";
                      badgeText = "✓ Correct Answer";
                    } else if (isOptionSelected && !isOptionCorrect) {
                      bgClass = "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                      borderClass = "border-red-500";
                      badgeVariant = "destructive";
                      badgeText = "✗ Your Answer";
                    } else if (!isOptionSelected && isOptionCorrect) {
                      badgeVariant = "outline";
                      badgeText = "○ Correct (not selected)";
                    }

                    return (
                      <div 
                        key={val} 
                        className={`p-3 border rounded-lg text-sm flex gap-3 transition-all duration-200 hover:shadow-sm ${bgClass} ${borderClass}`}
                        role="listitem"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-muted-foreground">{val}.</span>
                          <div dangerouslySetInnerHTML={{ __html: label }} />
                        </div>
                        {badgeText && (
                          <Badge 
                            variant={badgeVariant} 
                            className="text-xs ml-auto"
                            aria-label={badgeText}
                          >
                            {badgeText}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {solutionStr && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Explanation:
                </h4>
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <div 
                    dangerouslySetInnerHTML={{ __html: solutionStr }} 
                    aria-label="Solution explanation"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
