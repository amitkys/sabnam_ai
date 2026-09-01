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
  questionTimes: Map<string, number>; // questionId -> seconds spent (rounded for DB/UI)
  questionTimesMs: Map<string, number>; // questionId -> exact milliseconds spent
  timeRemaining: number | null; // overall countdown in seconds
  activeQuestionIndex: number;
  hasDeclinedFullscreen: boolean;
  testStatus: "active" | "submitted" | null;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  syncErrorCount: number;

  // actions
  setAttemptId: (attemptId: string) => void;
  setLanguage: (lang: string) => void;
  setAnswer: (questionId: string, answer: Answer) => void;
  toggleReview: (questionId: string) => void;
  setActiveQuestionIndex: (index: number) => void;
  clearAnswer: (questionId: string) => void;
  markAsSynced: (questionId: string) => void;
  markBatchAsSynced: (questionIds: string[]) => void;
  setHasDeclinedFullscreen: (declined: boolean) => void;
  setTestStatus: (status: "active" | "submitted" | null) => void;
  setIsSyncing: (isSyncing: boolean) => void;
  setLastSyncedAt: (timestamp: number) => void;
  incrementSyncErrorCount: () => void;
  resetSyncErrorCount: () => void;

  // timer actions
  addQuestionDurationMs: (questionId: string, deltaMs: number) => void;
  incrementQuestionTime: (questionId: string, deltaSeconds?: number) => void;
  getQuestionTime: (questionId: string) => number;
  setTimeRemaining: (seconds: number) => void;
  decrementTimeRemaining: (deltaSeconds?: number) => void;

  // navigation
  goToNext: (totalQuestions: number) => void;
  goToPrevious: () => void;

  // hydration from server
  hydrateFromServer: (
    responses: Array<{
      questionId: string;
      userAnswer: string;
      timeTaken?: number;
    }>,
  ) => void;

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
      questionTimes: new Map(),
      questionTimesMs: new Map(),
      timeRemaining: null,
      activeQuestionIndex: 0,
      hasDeclinedFullscreen: false,
      testStatus: null,
      lastSyncedAt: null,
      isSyncing: false,
      syncErrorCount: 0,

      setAttemptId: (attemptId) => set({ attemptId }),
      setLanguage: (lang) => set({ language: lang }),
      setHasDeclinedFullscreen: (declined) =>
        set({ hasDeclinedFullscreen: declined }),
      setTestStatus: (status) => set({ testStatus: status }),
      setIsSyncing: (isSyncing) => set({ isSyncing }),
      setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
      incrementSyncErrorCount: () =>
        set((state) => ({ syncErrorCount: state.syncErrorCount + 1 })),
      resetSyncErrorCount: () => set({ syncErrorCount: 0 }),

      // timer actions
      setTimeRemaining: (seconds) =>
        set({ timeRemaining: Math.max(0, seconds) }),
      decrementTimeRemaining: (deltaSeconds = 1) =>
        set((state) => {
          if (state.timeRemaining === null) return {};
          const next = Math.max(0, state.timeRemaining - deltaSeconds);

          return { timeRemaining: next };
        }),

      addQuestionDurationMs: (questionId, deltaMs) => {
        set((state) => {
          if (state.testStatus === "submitted" || deltaMs <= 0) return {};

          const newTimesMs = new Map(state.questionTimesMs);
          const currentMs = newTimesMs.get(questionId) || 0;
          const updatedMs = currentMs + deltaMs;

          newTimesMs.set(questionId, updatedMs);

          const newTimes = new Map(state.questionTimes);

          newTimes.set(questionId, Math.round(updatedMs / 1000));

          return { questionTimesMs: newTimesMs, questionTimes: newTimes };
        });
      },

      incrementQuestionTime: (questionId, deltaSeconds = 1) => {
        set((state) => {
          if (state.testStatus === "submitted") return {};

          return get().addQuestionDurationMs(
            questionId,
            deltaSeconds * 1000,
          ) as any;
        });
      },

      getQuestionTime: (questionId) => {
        return get().questionTimes.get(questionId) || 0;
      },

      // set / update answer
      setAnswer: (questionId, answer) => {
        set((state) => {
          if (state.testStatus === "submitted") {
            return state;
          }

          const newAnswers = new Map(state.answers);

          newAnswers.set(questionId, answer);

          // Once answered, question should no longer stay in "review" state.
          const newReview = new Set(state.markedForReview);

          newReview.delete(questionId);

          const newPending = new Set(state.pendingSync);

          newPending.add(questionId);

          return {
            answers: newAnswers,
            markedForReview: newReview,
            pendingSync: newPending,
          };
        });
      },

      markAsSynced: (questionId) => {
        set((state) => {
          const newPending = new Set(state.pendingSync);

          newPending.delete(questionId);

          return { pendingSync: newPending };
        });
      },

      markBatchAsSynced: (questionIds) => {
        set((state) => {
          const newPending = new Set(state.pendingSync);

          for (const id of questionIds) {
            newPending.delete(id);
          }

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

          return { markedForReview: newReview };
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
          const newTimes = new Map(state.questionTimes);
          const newTimesMs = new Map(state.questionTimesMs);

          responses.forEach((r) => {
            // CRITICAL: Only overwrite answer if we don't have pending local changes for this question
            if (!state.pendingSync.has(r.questionId)) {
              newAnswers.set(r.questionId, r.userAnswer);
            }
            if (typeof r.timeTaken === "number" && r.timeTaken > 0) {
              if (!newTimes.has(r.questionId)) {
                newTimes.set(r.questionId, r.timeTaken);
                newTimesMs.set(r.questionId, r.timeTaken * 1000);
              }
            }
          });

          return {
            answers: newAnswers,
            questionTimes: newTimes,
            questionTimesMs: newTimesMs,
          };
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

      reset: () => {
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem("test-attempt-storage");
          } catch {}
        }
        set({
          attemptId: null,
          language: "en",
          answers: new Map(),
          markedForReview: new Set(),
          pendingSync: new Set(),
          questionTimes: new Map(),
          questionTimesMs: new Map(),
          timeRemaining: null,
          activeQuestionIndex: 0,
          hasDeclinedFullscreen: false,
          testStatus: null,
          lastSyncedAt: null,
          isSyncing: false,
          syncErrorCount: 0,
        });
      },
    }),

    {
      name: "test-attempt-storage", // sessionStorage key
      // Custom serialization for Map and Set
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);

          if (!str) return null;
          try {
            const parsed = JSON.parse(str);

            if (
              !parsed?.state?.attemptId ||
              parsed?.state?.testStatus === "submitted"
            ) {
              sessionStorage.removeItem(name);

              return null;
            }

            return {
              state: {
                ...parsed.state,
                attemptId: parsed.state.attemptId || null,
                language: parsed.state.language || "en",
                answers: new Map(Object.entries(parsed.state.answers || {})),
                markedForReview: new Set(parsed.state.markedForReview || []),
                pendingSync: new Set(parsed.state.pendingSync || []),
                questionTimes: new Map(
                  Object.entries(parsed.state.questionTimes || {}).map(
                    ([k, v]) => [k, Number(v) || 0],
                  ),
                ),
                questionTimesMs: new Map(
                  Object.entries(parsed.state.questionTimesMs || {}).map(
                    ([k, v]) => [k, Number(v) || 0],
                  ),
                ),
                timeRemaining:
                  typeof parsed.state.timeRemaining === "number"
                    ? parsed.state.timeRemaining
                    : null,
                activeQuestionIndex:
                  typeof parsed.state.activeQuestionIndex === "number"
                    ? parsed.state.activeQuestionIndex
                    : 0,
                hasDeclinedFullscreen:
                  parsed.state.hasDeclinedFullscreen || false,
                testStatus: parsed.state.testStatus || null,
                lastSyncedAt: parsed.state.lastSyncedAt || null,
                isSyncing: false,
                syncErrorCount: 0,
              },
            };
          } catch {
            sessionStorage.removeItem(name);

            return null;
          }
        },
        setItem: (name, value) => {
          if (
            !value.state.attemptId ||
            value.state.testStatus === "submitted"
          ) {
            sessionStorage.removeItem(name);

            return;
          }

          const str = JSON.stringify({
            state: {
              ...value.state,
              attemptId: value.state.attemptId,
              language: value.state.language,
              answers: Object.fromEntries(value.state.answers),
              markedForReview: Array.from(value.state.markedForReview),
              pendingSync: Array.from(value.state.pendingSync),
              questionTimes: Object.fromEntries(value.state.questionTimes),
              questionTimesMs: Object.fromEntries(
                value.state.questionTimesMs || new Map(),
              ),
              timeRemaining: value.state.timeRemaining,
              activeQuestionIndex: value.state.activeQuestionIndex,
              hasDeclinedFullscreen: value.state.hasDeclinedFullscreen,
              testStatus: value.state.testStatus,
              lastSyncedAt: value.state.lastSyncedAt,
            },
          });

          sessionStorage.setItem(name, str);
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    },
  ),
);

/**
 * Clears all local test attempt data (Zustand state, sessionStorage, and attempt started markers)
 * to ensure next attempts start in a completely clean environment.
 */
export function clearAttemptLocalStorage(attemptId?: string) {
  if (typeof window === "undefined") return;

  try {
    // 1. Reset in-memory Zustand store
    useNewTestAttemptStore.getState().reset();

    // 2. Remove primary session storage entry
    sessionStorage.removeItem("test-attempt-storage");

    // 3. Clear attempt markers in localStorage
    if (attemptId) {
      localStorage.removeItem(`attempt_started_${attemptId}`);
    }

    // Clean up any lingering attempt_started_* markers in localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);

      if (
        key &&
        (key.startsWith("attempt_started_") || key.startsWith("attempt_"))
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch {}
}
