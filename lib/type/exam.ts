// @/lib/type/exam.ts

export interface Chapter {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Exam {
  id: string;
  name: string;
  isFavourite: boolean;
  subjects: Subject[];
}

export interface ExamData {
  exams: Exam[];
}

export interface ExamNavigationState {
  examType: string | null;
  subject: string | null;
  chapter: string | null;
}
