import type { TestAttemptQuestionFetched, MultiLangText } from "@/lib/type";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type QuestionStatusType = "solved" | "later" | "skipped";

// Updated Answer interface to match new structure
interface Answer {
  questionId: string;
  selectedOptionIndex: number;
  selectedAnswer: MultiLangText; // The actual selected option text
  markAs?: string | null;
}

interface QuizState {
  // Core test data
  testData: TestAttemptQuestionFetched | null;
  setTestData: (data: TestAttemptQuestionFetched) => void;

  // Current question index
  currentQuestion: number;
  testTitle: MultiLangText | null;
  exactName: string | null;
  selectedLanguage: string | null; // Track current language
  setTestTitle: (title: MultiLangText) => void;
  setCurrentQuestion: (index: number) => void;
  setSelectedLanguage: (lang: string) => void;

  // Track status of each question
  questionStatus: Record<string, QuestionStatusType>;
  setQuestionStatus: (questionId: string, status: QuestionStatusType) => void;

  // Selected answers
  selectedAnswers: Record<string, Answer>;
  setAnswer: (
    questionId: string,
    optionIndex: number,
    optionText: MultiLangText,
  ) => void;
  setSelectedAnswers: (answers: Record<string, Answer>) => void;

  // UI Toggles
  showNumbers: boolean;
  toggleShowNumbers: () => void;

  // Test start & submission state - persisted
  hasStarted: boolean;
  startTime: string;
  currentAttemptId: string | null; // Track current attempt
  startTest: (attemptId?: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;

  // Reset (optional utility)
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      testData: null,
      testTitle: null,
      exactName: null,
      selectedLanguage: null,

      setTestTitle: (title) => set({ testTitle: title }),
      setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),

      setTestData: (data) => {
        // const testTitle = data?.testSeries?.title || null;
        const selectedLanguage = data.selectedLanguage;
        const exactName = data.testSeries?.exactName;
        const questionStatusMap: Record<string, QuestionStatusType> = {};
        const answersMap: Record<string, Answer> = {};

        if (data.answers && data.answers.length > 0) {
          data.answers.forEach((answer) => {
            const questionId = answer.questionId;

            if (answer.markAs === "later") {
              questionStatusMap[questionId] = "later";
            } else if (answer.markAs === "skipped") {
              questionStatusMap[questionId] = "skipped";
            } else if (answer.markAs === "solved") {
              questionStatusMap[questionId] = "solved";
            } else if (answer.selectedOptionIndex !== null) {
              questionStatusMap[questionId] = "solved";
            }

            if (answer.selectedOptionIndex !== null) {
              const question = data.testSeries.questions.find(
                (q) => q.id === questionId,
              );

              if (question && question.options[answer.selectedOptionIndex]) {
                const selectedOption =
                  question.options[answer.selectedOptionIndex];

                answersMap[questionId] = {
                  questionId,
                  selectedOptionIndex: answer.selectedOptionIndex,
                  selectedAnswer: selectedOption,
                  markAs: answer.markAs,
                };
              }
            }
          });
        }

        let lastAnsweredIndex = 0;

        if (data.answers && data.answers.length > 0) {
          const questionIds = data.testSeries.questions.map((q) => q.id);
          const lastAnsweredQuestionId =
            data.answers[data.answers.length - 1].questionId;

          lastAnsweredIndex = questionIds.indexOf(lastAnsweredQuestionId);

          if (
            lastAnsweredIndex !== -1 &&
            lastAnsweredIndex < questionIds.length - 1
          ) {
            lastAnsweredIndex += 1;
          }
        }

        const currentState = get();
        const isSameAttempt = currentState.currentAttemptId === data.id;
        const shouldKeepStartedState = isSameAttempt && currentState.hasStarted;

        set({
          testData: data,
          exactName: exactName,
          selectedLanguage: selectedLanguage,
          questionStatus: questionStatusMap,
          selectedAnswers: answersMap,
          currentQuestion: Math.max(0, lastAnsweredIndex),
          currentAttemptId: data.id,
          hasStarted: shouldKeepStartedState,
          startTime: shouldKeepStartedState
            ? currentState.startTime
            : new Date(data.startedAt).toISOString(),
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
      setAnswer: (questionId, optionIndex, optionText) =>
        set((state) => ({
          selectedAnswers: {
            ...state.selectedAnswers,
            [questionId]: {
              questionId,
              selectedOptionIndex: optionIndex,
              selectedAnswer: optionText,
              markAs: "solved",
            },
          },
        })),

      setSelectedAnswers: (answers) => set({ selectedAnswers: answers }),

      showNumbers: false,
      toggleShowNumbers: () =>
        set((state) => ({ showNumbers: !state.showNumbers })),

      hasStarted: false,
      startTime: new Date().toISOString(),
      currentAttemptId: null,
      startTest: (attemptId) => {
        const startTime = new Date().toISOString();

        set({
          hasStarted: true,
          startTime,
          currentAttemptId: attemptId || get().currentAttemptId,
        });
      },

      isSubmitting: false,
      setIsSubmitting: (value) => set({ isSubmitting: value }),

      resetQuiz: () =>
        set({
          testData: null,
          testTitle: null,
          selectedLanguage: "en",
          currentQuestion: 0,
          questionStatus: {},
          selectedAnswers: {},
          hasStarted: false,
          startTime: new Date().toISOString(),
          showNumbers: false,
          isSubmitting: false,
          currentAttemptId: null,
        }),
    }),
    {
      name: "quiz-storage",
      storage: createJSONStorage(() => sessionStorage), // ✅ switched to sessionStorage
      partialize: (state) => ({
        hasStarted: state.hasStarted,
        startTime: state.startTime,
        currentAttemptId: state.currentAttemptId,
        selectedLanguage: state.selectedLanguage,
      }),
    },
  ),
);
