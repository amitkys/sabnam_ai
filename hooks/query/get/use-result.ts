import { useQuery } from "@tanstack/react-query";
import { getResultAction } from "@/lib/action/result";

// Derived types for the result based on schema
export interface IResultQuestionOption {
  value: string;
  label: string;
}

export interface IResultQuestion {
  id: string;
  testPaperId: string;
  questionId: string;
  positiveMarks: number;
  negativeMarks: number;
  orderIndex: number;
  question: {
    id: string;
    content: any;
    imageUrl: string | null;
    type: string;
    difficulty: string;
    solution: any;
    options: any;
    correctValue: string | null;
    categoryId: string;
    createdAt: Date;
  };
  studentResponse: {
    id: string;
    attemptId: string;
    questionId: string;
    userAnswer: string | null;
    isCorrect: boolean;
    timeTaken: number;
  } | null;
}

export interface IResultData {
  attempt: {
    id: string;
    score: number | null;
    status: string;
    startedAt: Date;
    submittedAt: Date | null;
    language: string;
  };
  testPaper: {
    title: string;
    totalMarks: number;
    duration: number;
  };
  questions: IResultQuestion[];
}

export const useResult = (attemptId: string) => {
  return useQuery({
    queryKey: ["result", attemptId],
    queryFn: async (): Promise<IResultData> => {
      const response = await getResultAction({ attemptId });
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch result data");
      }
      return response.data as any; // Type assertion since server action returns plain objects
    },
    enabled: !!attemptId,
  });
};
