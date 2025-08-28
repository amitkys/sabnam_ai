export interface TestSeriesDetails {
  exactName: string;
  questions: {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correctAnswer: string;
  }[];
  userAttempts: {
    attemptId: string;
    startedAt: Date;
    completedAt: Date | null;
    score: number | null;
    answers: {
      questionId: string;
      userAnswer: string | undefined;
      isCorrect: boolean;
    }[];
  }[];
  totalMarks: number;
}

export interface QuestionCardProps {
  question: TestSeriesDetails["questions"][number];
  index: number;
  userAnswer?: {
    questionId: string;
    userAnswer: string | undefined;
    isCorrect: boolean;
  };
  onExplainClick: (question: any, userAnswer: any) => void;
  isLastQuestion: boolean;
}
