import type { Answer, FetchedTestSeriesData } from "@/lib/type";

import { create } from "zustand";

interface QuestionStatus {
  [key: number]: "solved" | "later" | "skipped";
}

interface QuizState {
  testData: FetchedTestSeriesData | null;
  setTestData: (data: FetchedTestSeriesData) => void;
  currentQuestion: number;
  setCurrentQuestion: (index: number) => void;
  questionStatus: QuestionStatus;
  setQuestionStatus: (
    index: number,
    status: "solved" | "later" | "skipped"
  ) => void;
  selectedAnswers: Record<string, Answer>;
  setAnswer: (
    questionId: string,
    optionId: string,
    optionText: string,
    correctAnswer: string
  ) => void;
  showNumbers: boolean;
  toggleShowNumbers: () => void;
  hasStarted: boolean;
  startTest: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  startTime: string; // Change to string for serialization
  // resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>()((set) => ({
  testData: null,
  setTestData: (data: FetchedTestSeriesData) => set({ testData: data }),
  currentQuestion: 0,
  setCurrentQuestion: (index) => set({ currentQuestion: index }),
  questionStatus: {},
  setQuestionStatus: (index, status) =>
    set((state) => ({
      questionStatus: { ...state.questionStatus, [index]: status },
    })),
  selectedAnswers: {},
  setAnswer: (questionId, optionId, optionText, correctAnswer) =>
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: {
          questionId,
          optionId,
          answer: correctAnswer,
          selectedAnswer: optionText,
        },
      },
    })),
  showNumbers: false,
  toggleShowNumbers: () =>
    set((state) => ({ showNumbers: !state.showNumbers })),
  hasStarted: false,
  startTest: () =>
    set({ hasStarted: true, startTime: new Date().toISOString() }),
  isSubmitting: false,
  setIsSubmitting: (value) => set({ isSubmitting: value }),
  startTime: new Date().toISOString(), // Store as ISO string
  // resetQuiz: () =>
  //   set({
  //     currentQuestion: 0,
  //     questionStatus: {},
  //     selectedAnswers: {},
  //     hasStarted: false,
  //     startTime: new Date().toISOString(),
  //     showNumbers: false,
  //   }),
}));
