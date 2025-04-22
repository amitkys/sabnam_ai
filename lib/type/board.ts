// @/lib/type/board.ts

export interface Chapter {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Standard {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Board {
  id: string;
  name: string;
  standards: Standard[];
}

export interface EducationalData {
  boards: Board[];
}

export interface NavigationState {
  boardType: string | null;
  standard: string | null;
  subject: string | null;
  chapter: string | null;
}
