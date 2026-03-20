import { create } from "zustand";
import { persist } from "zustand/middleware";

// type / shape of data

type Answer = string; // could be "A", or "A, B, C"

type QuestionStatus = "answered" | "reviewed" | "unanswered";

interface TestAttemptState {
  // core state
  attemptId: string | null;
  language: string;
  answers: Map<string, Answer>;
  markedForReview: Set<string>;
  pendingSync: Set<string>;
  activeQuestionIndex: number;
  hasDeclinedFullscreen: boolean;
  testStatus: "active" | "submitted" | null;

  // actions
  setAttemptId: (attemptId: string) => void;
  setLanguage: (lang: string) => void;
  setAnswer: (questionId: string, answer: Answer) => void;
  toggleReview: (questionId: string) => void;
  setActiveQuestionIndex: (index: number) => void;
  clearAnswer: (questionId: string) => void;
  markAsSynced: (questionId: string) => void;
  setHasDeclinedFullscreen: (declined: boolean) => void;
  setTestStatus: (status: "active" | "submitted" | null) => void;

  // navigation
  goToNext: (totalQuestions: number) => void;
  goToPrevious: () => void;

  // hydration from server
  hydrateFromServer: (responses: Array<{
    questionId: string;
    userAnswer: string;
  }>) => void;

  // derived state helpers
  getQuestionStatus: (questionId: string) => QuestionStatus;
  hasAnswer: (questionId: string) => boolean;
  isMarkedForReview: (questionId: string) => boolean;

  // reset for new attempt
  reset: () => void;
}

export const useNewTestAttemptStore = create<TestAttemptState>()(
  persist(
    (set, get) => ({
      // initial state
      attemptId: null,
      language: "en",
      answers: new Map(),
      markedForReview: new Set(),
      pendingSync: new Set(),
      activeQuestionIndex: 0,
      hasDeclinedFullscreen: false,
      testStatus: null,

      setAttemptId: (attemptId) => set({ attemptId }),
      setLanguage: (lang) => set({ language: lang }),
      setHasDeclinedFullscreen: (declined) => set({ hasDeclinedFullscreen: declined }),
      setTestStatus: (status) => set({ testStatus: status }),

      // set / update answer
      setAnswer: (questionId, answer) => {
        set((state) => {
          const newAnswers = new Map(state.answers);
          newAnswers.set(questionId, answer);

          const newPending = new Set(state.pendingSync);
          newPending.add(questionId);

          return { answers: newAnswers, pendingSync: newPending }
        });
      },

      markAsSynced: (questionId) => {
        set((state) => {
          const newPending = new Set(state.pendingSync);
          newPending.delete(questionId);
          return { pendingSync: newPending };
        });
      },

      // toggle review flag
      toggleReview: (questionId) => {
        set((state) => {
          const newReview = new Set(state.markedForReview);
          if (newReview.has(questionId)) {
            newReview.delete(questionId);
          } else {
            newReview.add(questionId);
          }
          return { markedForReview: newReview }
        });
      },

      setActiveQuestionIndex: (index) => set({ activeQuestionIndex: index }),

      clearAnswer: (questionId) => {
        set((state) => {
          const newAnswers = new Map(state.answers);
          newAnswers.delete(questionId);
          return { answers: newAnswers };
        });
      },

      goToNext: (totalQuestions) => {
        set((state) => {
          if (state.activeQuestionIndex < totalQuestions - 1) {
            return { activeQuestionIndex: state.activeQuestionIndex + 1 };
          }
          return {};
        });
      },

      goToPrevious: () => {
        set((state) => {
          if (state.activeQuestionIndex > 0) {
            return { activeQuestionIndex: state.activeQuestionIndex - 1 };
          }
          return {};
        });
      },

      // initialize from server responses
      hydrateFromServer: (responses) => {
        set((state) => {
          const newAnswers = new Map(state.answers);

          responses.forEach(r => {
            // CRITICAL: Only overwrite if we don't have pending local changes for this question
            if (!state.pendingSync.has(r.questionId)) {
              newAnswers.set(r.questionId, r.userAnswer);
            }
          });

          return { answers: newAnswers };
        });

      },

      // derived state
      getQuestionStatus: (questionId) => {
        const state = get();
        if (state.markedForReview.has(questionId)) return "reviewed";
        if (state.answers.has(questionId)) return "answered";
        return "unanswered";
      },

      hasAnswer: (questionId) => get().answers.has(questionId),
      isMarkedForReview: (questionId) => get().markedForReview.has(questionId),

      reset: () => set({
        attemptId: null,
        language: "en",
        answers: new Map(),
        markedForReview: new Set(),
        pendingSync: new Set(),
        activeQuestionIndex: 0,
        hasDeclinedFullscreen: false,
        testStatus: null,
      }),
    }),

    {
      name: 'test-attempt-storage', // sessionStorage key
      // Custom serialization for Map and Set
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            state: {
              ...parsed.state,
              attemptId: parsed.state.attemptId || null,
              language: parsed.state.language || "en",
              answers: new Map(Object.entries(parsed.state.answers || {})),
              markedForReview: new Set(parsed.state.markedForReview || []),
              pendingSync: new Set(parsed.state.pendingSync || []),
              hasDeclinedFullscreen: parsed.state.hasDeclinedFullscreen || false,
              testStatus: parsed.state.testStatus || null,
            },
          };
        },
        setItem: (name, value) => {
          const str = JSON.stringify({
            state: {
              ...value.state,
              attemptId: value.state.attemptId,
              language: value.state.language,
              answers: Object.fromEntries(value.state.answers),
              markedForReview: Array.from(value.state.markedForReview),
              pendingSync: Array.from(value.state.pendingSync),
              hasDeclinedFullscreen: value.state.hasDeclinedFullscreen,
              testStatus: value.state.testStatus,
            },
          });
          sessionStorage.setItem(name, str);
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
);