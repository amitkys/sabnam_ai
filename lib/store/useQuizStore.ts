/*
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
*/

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
  startTime: string;
}

const mockData: FetchedTestSeriesData = {
  testseries: {
    id: "test-1",
    title: "Set 1: Basic Concepts",
    duration: 300,
  },
  questions: [
    {
      id: "q1",
      text: "What is $2 + 2$?",
      answer: "4",
      options: [
        { id: "q1o1", text: "3" },
        { id: "q1o2", text: "4" },
        { id: "q1o3", text: "5" },
        { id: "q1o4", text: "6" },
      ],
    },
    {
      id: "q2",
      text: "Which of the following is a mammal?",
      answer: "Dolphin",
      options: [
        { id: "q2o1", text: "Shark" },
        { id: "q2o2", text: "Dolphin" },
        { id: "q2o3", text: "Octopus" },
        { id: "q2o4", text: "Tuna" },
      ],
    },
    {
      id: "q3",
      text: "Find the value of $5^0$.",
      answer: "1",
      options: [
        { id: "q3o1", text: "0" },
        { id: "q3o2", text: "1" },
        { id: "q3o3", text: "5" },
        { id: "q3o4", text: "Undefined" },
      ],
    },
  ],
};

export const useQuizStore = create<QuizState>()((set) => ({
  // Preloaded mock state
  testData: mockData,
  currentQuestion: 2,
  questionStatus: {
    0: "later",
    1: "skipped",
    2: "later",
  },
  selectedAnswers: {
    q1: {
      questionId: "q1",
      optionId: "q1o2",
      selectedAnswer: "4",
      answer: "4",
    },
    q2: {
      questionId: "q2",
      optionId: "q2o1",
      selectedAnswer: "Shark",
      answer: "Dolphin",
    },
  },
  showNumbers: false,
  hasStarted: true,
  startTime: new Date().toISOString(),
  isSubmitting: false,

  // Updaters
  setTestData: (data) => set({ testData: data }),
  setCurrentQuestion: (index) => set({ currentQuestion: index }),
  setQuestionStatus: (index, status) =>
    set((state) => ({
      questionStatus: { ...state.questionStatus, [index]: status },
    })),
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
  toggleShowNumbers: () =>
    set((state) => ({ showNumbers: !state.showNumbers })),
  startTest: () =>
    set({ hasStarted: true, startTime: new Date().toISOString() }),
  setIsSubmitting: (value) => set({ isSubmitting: value }),
}));
