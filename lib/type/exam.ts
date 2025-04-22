// @/lib/type/exam.ts
import type { Subject } from "@/lib/type/board";

export interface IExamName {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface IExam {
  examName: IExamName[];
}

export interface IExamNavigationState {
  type: string | null;
  subject: string | null;
  chapter: string | null;
}
