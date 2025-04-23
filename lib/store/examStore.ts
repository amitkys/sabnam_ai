// @/lib/store/examStore.ts
import type { Exam, ExamNavigationState } from "@/lib/type/exam";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { examData } from "@/lib/exams/data";

interface ExamState extends ExamNavigationState {
  data: {
    exams: Exam[];
  };
  examName: string | null;
  subjectName: string | null;
  chapterName: string | null;
  // Actions
  setNavigation: (nav: Partial<ExamNavigationState>) => void;
  resetNavigation: () => void;
  updateNames: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      // Navigation state
      examType: null,
      subject: null,
      chapter: null,
      // Content state
      data: examData,
      examName: null,
      subjectName: null,
      chapterName: null,
      // Actions
      setNavigation: (nav) => {
        set({ ...nav });
        get().updateNames();
      },
      resetNavigation: () => {
        set({
          examType: null,
          subject: null,
          chapter: null,
          examName: null,
          subjectName: null,
          chapterName: null,
        });
      },
      updateNames: () => {
        const { examType, subject, chapter, data } = get();
        let examName = null;
        let subjectName = null;
        let chapterName = null;

        if (examType) {
          const exam = data.exams.find((e) => e.id === examType);

          if (exam) {
            examName = exam.name;
            if (subject) {
              const subj = exam.subjects.find((s) => s.id === subject);

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

        set({
          examName,
          subjectName,
          chapterName,
        });
      },
    }),
    {
      name: "exam-storage",
      partialize: (state) => ({
        examType: state.examType,
        subject: state.subject,
        chapter: state.chapter,
      }),
    },
  ),
);
