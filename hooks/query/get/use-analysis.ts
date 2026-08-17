import { useQuery } from "@tanstack/react-query";

import { getAnalysisAction } from "@/lib/action/analysis";

export interface IAnalysisQuestion {
  id: string;
  testPaperId: string;
  questionId: string;
  positiveMarks: number;
  negativeMarks: number;
  orderIndex: number;
  question: {
    id: string;
    content: unknown;
    imageUrl: string | null;
    type: string;
    difficulty: string;
    solution: unknown;
    options: unknown;
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

export interface IAnalysisData {
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
  questions: IAnalysisQuestion[];
}

export function useAnalysis(attemptId: string) {
  return useQuery({
    queryKey: ["analysis", attemptId],
    queryFn: async (): Promise<IAnalysisData> => {
      const res = await getAnalysisAction({ attemptId });

      if (!res.success) {
        throw new Error(res.error || "Failed to fetch analysis data");
      }

      return res.data as IAnalysisData;
    },
    enabled: !!attemptId,
    retry: false,
  });
}
