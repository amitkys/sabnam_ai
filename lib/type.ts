import { Prisma } from "@prisma/client";

export interface MultiLangText extends Prisma.JsonObject {
  en: string;
  hi: string;
}
interface IQuestion {
  text: MultiLangText;
  options: MultiLangText[];
  answerIndex: number;
  marks?: number;
  tags?: string[];
}
interface ITestSeries {
  title: string;
  exactName: string;
  duration: number;
  level: string;
  availableLanguage: string[];
  preferredLanguage: string;
  isPublic: boolean;
  questions: IQuestion[];
}

export interface ITestSeriesInput {
  testseries: ITestSeries;
}
// Types for: user giving test
export interface TestAttemptQuestionFetched {
  id: string;
  userId: string;
  selectedLanguage: string;
  startedAt: Date;
  testSeries: {
    id: string;
    title: ITestSeries["title"];
    exactName: ITestSeries["exactName"];
    duration: ITestSeries["duration"];
    createdAt: Date;
    level: ITestSeries["level"];
    availableLanguage: ITestSeries["availableLanguage"];
    preferredLanguage: ITestSeries["preferredLanguage"];
    questions: {
      id: string;
      tags?: IQuestion["tags"];
      text: IQuestion["text"];
      options: IQuestion["options"];
    }[];
  };
  answers: {
    id: string;
    questionId: string;
    markAs: string | null;
    selectedOptionIndex: number | null;
  }[];
}

// Types for test attempt submission
export interface TestAttemptSubmission {
  testSeriesId: string;
  userId: string;
  startedAt: string;
  completedAt: string;
  answers: TestAnswer[];
}

export interface TestAnswer {
  questionId: string; // References Question model
  optionId: string; // References Option model
  isCorrect: boolean; // Calculated by comparing answer
}

// Interface for tracking answers during test
export interface Answer {
  questionId: string; // References Question model
  optionId: string; // References Option model
  answer: string; // Correct answer from Question
  selectedAnswer: string; // User selected option text
}

export interface CustomProps {
  heading: string;
  data: string | number;
}

export interface TestSeriesResponse {
  success: boolean;
  data: Array<{
    id: string;
    title: string;
    duration: number;
    hasAttempted: boolean;
    lastScore: number | null;
    isCompleted: boolean;
    totalQuestions: number;
    level: string;
  }>;
}

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export interface TestSummaryResponse {
  testSummary: {
    testSeriesId: string;
    attempId: string;
    testName: string;
    attemptDate: Date;
    obtainedMarks: number;
    totalMarks: number;
  }[];
}

// types/user.ts
export interface UserType {
  id: string;
  name?: string | null; // Allow null
  email?: string | null; // Allow null
  image?: string | null; // Allow null
}

export interface ISubject {
  subjectName: string | string[] | undefined;
}

export interface Answer {
  questionId: string;
  optionId: string;
  selectedAnswer: string;
  answer: string;
}

export interface TestAttemptSubmission {
  testSeriesId: string;
  userId: string;
  startedAt: string;
  completedAt: string;
  answers: {
    questionId: string;
    optionId: string;
    isCorrect: boolean;
  }[];
}

export interface SaveQuestionResponseResult {
  success: boolean;
  error?: string;
}

export interface IMainTestSeriesResponse {
  data: {
    id: string;
    title: string;
    duration: number;
    hasAttempted: boolean;
    lastScore: number | null;
    isCompleted: boolean;
    totalQuestions: number;
    level: string;
  }[];
}

export interface ITestAttemptHistory {
  id: string;
  score: number | null;
  startedAt: Date;
  completedAt: Date | null;
  testSeries: {
    title: string;
    duration: number;
    level: string;
  };
}

export interface ITestAttemptHistoryResponse {
  success: boolean;
  testAttemptHistory: ITestAttemptHistory[];
  count: number;
}
