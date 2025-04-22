// @/lib/store/boardStore.ts

import type { Board, NavigationState } from "@/lib/type/board";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { boardExam } from "@/lib/board/data";

interface EducationState extends NavigationState {
  data: {
    boards: Board[];
  };
  boardName: string | null;
  standardName: string | null;
  subjectName: string | null;
  chapterName: string | null;
  // Actions
  setNavigation: (nav: Partial<NavigationState>) => void;
  resetNavigation: () => void;
  updateNames: () => void;
}

export const useBoardStore = create<EducationState>()(
  persist(
    (set, get) => ({
      // Navigation state
      boardType: null,
      standard: null,
      subject: null,
      chapter: null,

      // Content state
      data: boardExam,
      boardName: null,
      standardName: null,
      subjectName: null,
      chapterName: null,

      // Actions
      setNavigation: (nav) => {
        set({ ...nav });
        get().updateNames();
      },

      resetNavigation: () => {
        set({
          boardType: null,
          standard: null,
          subject: null,
          chapter: null,
          boardName: null,
          standardName: null,
          subjectName: null,
          chapterName: null,
        });
      },

      updateNames: () => {
        const { boardType, standard, subject, chapter, data } = get();

        let boardName = null;
        let standardName = null;
        let subjectName = null;
        let chapterName = null;

        if (boardType) {
          const board = data.boards.find((b) => b.id === boardType);

          if (board) {
            boardName = board.name;

            if (standard) {
              const std = board.standards.find((s) => s.id === standard);

              if (std) {
                standardName = std.name;

                if (subject) {
                  const subj = std.subjects.find((s) => s.id === subject);

                  if (subj) {
                    subjectName = subj.name;

                    if (chapter) {
                      const chap = subj.chapters.find((c) => c.id === chapter);

                      if (chap) {
                        chapterName = chap.name;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        set({
          boardName,
          standardName,
          subjectName,
          chapterName,
        });
      },
    }),
    {
      name: "education-storage",
      partialize: (state) => ({
        boardType: state.boardType,
        standard: state.standard,
        subject: state.subject,
        chapter: state.chapter,
      }),
    },
  ),
);
