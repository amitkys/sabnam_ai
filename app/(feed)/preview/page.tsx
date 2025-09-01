"use client";

import { useState } from "react";
import { QuestionCard } from "@/components/analysis/QuestionCard";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TestSeriesDetails } from "@/components/analysis/types";

type UserQuestion = {
  text: { [key: string]: string };
  answerIndex: number;
  options: { [key: string]: string }[];
  marks: number;
  tags: string[];
};

const transformQuestion = (
  userQuestion: UserQuestion,
  index: number,
): TestSeriesDetails["questions"][number] => {
  const questionText = Object.values(userQuestion.text).join("\n\n---\n\n");
  const options = userQuestion.options.map((option, i) => ({
    id: `option-${index}-${i}`,
    text: Object.values(option).join(" / "),
  }));
  const correctAnserOption = userQuestion.options[userQuestion.answerIndex];
  const correctAnswer = Object.values(correctAnserOption).join(" / ");

  return {
    id: `question-${index}`,
    text: questionText,
    options: options,
    correctAnswer: correctAnswer,
  };
};

export default function PreviewPage() {
  const [singleQuestionJson, setSingleQuestionJson] = useState("");
  const [multiQuestionJson, setMultiQuestionJson] = useState("");
  const [questions, setQuestions] = useState<TestSeriesDetails["questions"]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSingleQuestionPreview = () => {
    try {
      const parsed: UserQuestion = JSON.parse(singleQuestionJson);
      const transformed = transformQuestion(parsed, 0);
      setQuestions([transformed]);
      setError(null);
    } catch (e) {
      setError("Invalid JSON for single question.");
      setQuestions([]);
    }
  };

  const handleMultiQuestionPreview = () => {
    try {
      const parsed: UserQuestion[] = JSON.parse(multiQuestionJson);
      const transformed = parsed.map(transformQuestion);
      setQuestions(transformed);
      setError(null);
    } catch (e) {
      setError("Invalid JSON for multiple questions.");
      setQuestions([]);
    }
  };

  const dummyOnExplainClick = () => {
    // Dummy function
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Question Preview</h1>
      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single">Single Question</TabsTrigger>
          <TabsTrigger value="multi">Multiple Questions</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Single Question JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your single question JSON here"
                value={singleQuestionJson}
                onChange={(e) => setSingleQuestionJson(e.target.value)}
                rows={15}
              />
              <Button onClick={handleSingleQuestionPreview} className="mt-4">
                Preview
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="multi">
          <Card>
            <CardHeader>
              <CardTitle>Multiple Questions JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your multiple questions JSON array here"
                value={multiQuestionJson}
                onChange={(e) => setMultiQuestionJson(e.target.value)}
                rows={15}
              />
              <Button onClick={handleMultiQuestionPreview} className="mt-4">
                Preview
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-8 space-y-4">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            isLastQuestion={index === questions.length - 1}
            onExplainClick={dummyOnExplainClick}
          />
        ))}
      </div>
    </div>
  );
}
