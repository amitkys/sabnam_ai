import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ITestAttemptHistoryResponse } from "@/lib/type";

interface ITestHistoryStore {
  history: ITestAttemptHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
  setHistory: (data: ITestAttemptHistoryResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearHistory: () => void;
  removeAttempt: (attemptId: string) => void;
  reset: () => void;
}

export const useTestHistory = create<ITestHistoryStore>()(
  persist(
    (set, get) => ({
      history: null,
      isLoading: false,
      error: null,
      setHistory: (data) => set({ history: data, error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearHistory: () => set({ history: null }),
      removeAttempt: (attemptId) => {
        const currentHistory = get().history;

        if (currentHistory?.testAttemptHistory) {
          const updatedHistory = {
            ...currentHistory,
            testAttemptHistory: currentHistory.testAttemptHistory.filter(
              (attempt) => attempt.id !== attemptId,
            ),
          };

          set({ history: updatedHistory });
        }
      },
      reset: () =>
        set({
          history: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "test-history",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
