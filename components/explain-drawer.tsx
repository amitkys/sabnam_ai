"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExplainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  options: any;
  correctAnswer: string;
  userAnswer: any;
}

export default function ExplainDrawer({
  isOpen,
  onClose,
  question,
  options,
  correctAnswer,
  userAnswer,
}: ExplainDrawerProps) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Add a state to track the current question ID
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null,
  );

  const formatExplanation = (text: string) => {
    return (
      text
        // First, handle the headers with colons
        .replace(/\*\*(.*?)\*\*:/g, "\n\n\n**$1:**\n\n") // Headers with colons
        .replace(/\*\*(.*?)\*\*\n/g, "\n\n\n**$1:**\n\n") // Headers without colons, add them
        .replace(/\n{4,}/g, "\n\n\n")
    ); // Normalize multiple newlines to maximum of 3
  };
  const fetchExplanation = async () => {
    if (!question) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.text,
          options: question.options,
          correctAnswer: question.correctAnswer,
          userAnswer: userAnswer?.userAnswer,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setExplanation(data.explanation);
      }
    } catch (err) {
      setError("Failed to load explanation. Please try again later.");
      console.error("Error fetching explanation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset states when the drawer opens or question changes
    if (isOpen && question) {
      // Check if it's a different question
      if (currentQuestionId !== question.id) {
        setExplanation(""); // Reset explanation
        setError(""); // Reset error
        setCurrentQuestionId(question.id); // Update current question ID
        fetchExplanation(); // Fetch new explanation
      }
    } else {
      // Reset states when drawer closes
      setCurrentQuestionId(null);
      setExplanation("");
      setError("");
    }
  }, [isOpen, question, currentQuestionId]);

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader className="sticky top-0 bg-background z-10 flex justify-between items-center">
            <DrawerTitle className="text-xl">Explanation</DrawerTitle>
            <DrawerClose asChild>
              <Button size="icon" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="h-[50vh] px-4">
            <ScrollArea className="h-full w-full">
              <div className="pr-4">
                {/* Question preview */}
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2">Question:</h3>
                  <div className="text-sm lg:text-base text-foreground/75">
                    <Markdown
                      rehypePlugins={[rehypeKatex]}
                      remarkPlugins={[remarkMath]}
                    >
                      {question?.text || ""}
                    </Markdown>
                  </div>
                </div>

                {/* Explanation content */}
                <div className="flex-1">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Generating explanation...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="bg-destructive/10 p-4 rounded-lg text-destructive">
                      <p>{error}</p>
                      <Button
                        className="mt-2"
                        size="sm"
                        variant="outline"
                        onClick={fetchExplanation}
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>h2]:mt-8 [&>h2]:mb-4 [&>p]:mb-4">
                      <Markdown
                        components={{
                          // Custom styling for strong tags (headers)
                          strong: ({ children }) => (
                            <strong className="text-primary text-base">
                              {children}
                            </strong>
                          ),
                          // Add more spacing after paragraphs
                          p: ({ children }) => (
                            <p className="mb-4">{children}</p>
                          ),
                          // Style lists
                          ul: ({ children }) => (
                            <ul className="my-4 list-disc pl-6">{children}</ul>
                          ),
                          li: ({ children }) => (
                            <li className="mb-2">{children}</li>
                          ),
                        }}
                        rehypePlugins={[rehypeKatex]}
                        remarkPlugins={[remarkMath]}
                      >
                        {formatExplanation(explanation) ||
                          "No explanation available."}
                      </Markdown>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>

          <DrawerFooter className="sticky bottom-0 bg-background z-10 border-t">
            <Button onClick={onClose}>Close</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
