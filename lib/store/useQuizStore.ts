/*
import type { Answer, FetchedTestSeriesData } from "@/lib/type";

import { create } from "zustand";

type QuestionStatusType = "solved" | "later" | "skipped";

interface QuizState {
  // Core test data
  testData: FetchedTestSeriesData | null;
  setTestData: (data: FetchedTestSeriesData) => void;

  // Current question index
  currentQuestion: number;
  setCurrentQuestion: (index: number) => void;

  // Track status of each question
  questionStatus: Record<string, QuestionStatusType>;
  setQuestionStatus: (questionId: string, status: QuestionStatusType) => void;

  // Selected answers
  selectedAnswers: Record<string, Answer>;
  setAnswer: (
    questionId: string,
    optionId: string,
    optionText: string,
    correctAnswer: string
  ) => void;
  setSelectedAnswers: (answers: Record<string, Answer>) => void;

  // UI Toggles
  showNumbers: boolean;
  toggleShowNumbers: () => void;

  // Test start & submission state
  hasStarted: boolean;
  startTime: string;
  startTest: () => void;

  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;

  // Reset (optional utility)
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  testData: null,
  setTestData: (data) => set({ testData: data }),

  currentQuestion: 0,
  setCurrentQuestion: (index) => set({ currentQuestion: index }),

  questionStatus: {},
  setQuestionStatus: (questionId, status) =>
    set((state) => ({
      questionStatus: {
        ...state.questionStatus,
        [questionId]: status,
      },
    })),

  selectedAnswers: {},
  setAnswer: (questionId, optionId, optionText, correctAnswer) =>
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: {
          questionId,
          optionId,
          selectedAnswer: optionText,
          answer: correctAnswer,
        },
      },
    })),
  setSelectedAnswers: (answers) => set({ selectedAnswers: answers }),

  showNumbers: false,
  toggleShowNumbers: () =>
    set((state) => ({ showNumbers: !state.showNumbers })),

  hasStarted: false,
  startTime: new Date().toISOString(),
  startTest: () =>
    set({ hasStarted: true, startTime: new Date().toISOString() }),

  isSubmitting: false,
  setIsSubmitting: (value) => set({ isSubmitting: value }),

  resetQuiz: () =>
    set({
      testData: null,
      currentQuestion: 0,
      questionStatus: {},
      selectedAnswers: {},
      hasStarted: false,
      startTime: new Date().toISOString(),
      showNumbers: false,
      isSubmitting: false,
    }),
}));
*/

import type { Answer, FetchedTestSeriesData } from "@/lib/type";

import { create } from "zustand";

type QuestionStatusType = "solved" | "later" | "skipped";

interface QuizState {
  // Core test data
  testData: FetchedTestSeriesData | null;
  setTestData: (data: FetchedTestSeriesData) => void;
  // Current question index
  currentQuestion: number;
  setCurrentQuestion: (index: number) => void;
  // Track status of each question
  questionStatus: Record<string, QuestionStatusType>;
  setQuestionStatus: (questionId: string, status: QuestionStatusType) => void;
  // Selected answers
  selectedAnswers: Record<string, Answer>;
  setAnswer: (
    questionId: string,
    optionId: string,
    optionText: string,
    correctAnswer: string,
  ) => void;
  setSelectedAnswers: (answers: Record<string, Answer>) => void;
  // UI Toggles
  showNumbers: boolean;
  toggleShowNumbers: () => void;
  // Test start & submission state
  hasStarted: boolean;
  startTime: string;
  startTest: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  // Reset (optional utility)
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  testData: null,
  // In setTestData function of useQuizStore
  setTestData: (data) => {
    const questionStatusMap: Record<string, QuestionStatusType> = {};
    const answersMap: Record<string, Answer> = {};

    // Initialize questions with appropriate status based on markAs or answers
    if (data.testAttempt?.answers) {
      data.testAttempt.answers.forEach((answer) => {
        const questionId = answer.questionId;

        // Set status based on markAs field from the database
        if (answer.markAs === "later") {
          questionStatusMap[questionId] = "later";
        } else if (answer.markAs === "skipped") {
          questionStatusMap[questionId] = "skipped";
        } else if (answer.markAs === "solved") {
          questionStatusMap[questionId] = "solved";
        } else if (answer.markAs === null && answer.optionId) {
          // If markAs is null but an option is selected, treat as "solved"
          questionStatusMap[questionId] = "solved";
        }

        // Create an answer entry if an option was selected
        if (answer.optionId) {
          // Find the corresponding question and option
          const question = data.testAttempt?.testSeries.questions.find(
            (q) => q.id === questionId,
          );
          const option = question?.options.find(
            (opt) => opt.id === answer.optionId,
          );

          if (question && option) {
            answersMap[questionId] = {
              questionId,
              optionId: answer.optionId,
              selectedAnswer: option.text,
              answer: question.answer,
            };
          }
        }
      });
    }

    // Find the last answered question index
    let lastAnsweredIndex = 0;

    if (data.testAttempt?.answers.length) {
      const questionIds = data.testAttempt.testSeries.questions.map(
        (q) => q.id,
      );

      // Find the last answer in the list (chronologically)
      const lastAnsweredQuestionId =
        data.testAttempt.answers[data.testAttempt.answers.length - 1]
          .questionId;

      // Set current question to point to the last answered question
      lastAnsweredIndex = questionIds.indexOf(lastAnsweredQuestionId);

      // Only move to the next question if the test is still in progress
      if (
        !data.testAttempt.completedAt &&
        lastAnsweredIndex !== -1 &&
        lastAnsweredIndex < questionIds.length - 1
      ) {
        lastAnsweredIndex += 1;
      }
    }

    set({
      testData: data,
      questionStatus: questionStatusMap,
      selectedAnswers: answersMap,
      currentQuestion: lastAnsweredIndex,
      // hasStarted: !!data.testAttempt?.startedAt,
      hasStarted: false,
      startTime:
        data.testAttempt?.startedAt instanceof Date
          ? data.testAttempt.startedAt.toISOString()
          : data.testAttempt?.startedAt || new Date().toISOString(),
    });
  },
  currentQuestion: 0,
  setCurrentQuestion: (index) => set({ currentQuestion: index }),

  questionStatus: {},
  setQuestionStatus: (questionId, status) =>
    set((state) => ({
      questionStatus: {
        ...state.questionStatus,
        [questionId]: status,
      },
    })),

  selectedAnswers: {},
  setAnswer: (questionId, optionId, optionText, correctAnswer) =>
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: {
          questionId,
          optionId,
          selectedAnswer: optionText,
          answer: correctAnswer,
        },
      },
      // Automatically mark as solved when answering
      // questionStatus: {
      //   ...state.questionStatus,
      //   [questionId]: "solved",
      // },
    })),
  setSelectedAnswers: (answers) => set({ selectedAnswers: answers }),

  showNumbers: false,
  toggleShowNumbers: () =>
    set((state) => ({ showNumbers: !state.showNumbers })),

  hasStarted: false,
  startTime: new Date().toISOString(),
  startTest: () =>
    set({ hasStarted: true, startTime: new Date().toISOString() }),

  isSubmitting: false,
  setIsSubmitting: (value) => set({ isSubmitting: value }),

  resetQuiz: () =>
    set({
      testData: null,
      currentQuestion: 0,
      questionStatus: {},
      selectedAnswers: {},
      hasStarted: false,
      startTime: new Date().toISOString(),
      showNumbers: false,
      isSubmitting: false,
    }),
}));
