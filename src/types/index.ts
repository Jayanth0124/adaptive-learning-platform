export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  category: string;
  explanation?: string;
  allQuestions?: Question[];
}

export interface QuizAttempt {
  id: string;
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
}

export interface StudentPerformance {
  id: string;
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number;
  difficultyDistribution: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
  categoryPerformance: Record<string, { correct: number; total: number }>;
  lastUpdated: Date;
  allQuestions?: Question[];
}

export interface AdaptiveSettings {
  poolSize: number;
  difficultyBalanceRatio: { easy: number; medium: number; hard: number };
  adaptationResponseTime: number;
  studentFitScore: number;
  minQuestionsBeforeAdaptation: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'student' | 'admin' | 'teacher';
  name: string;
  createdAt?: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    authorName: string;
    authorRole: 'admin' | 'teacher';
    targetRole: 'all' | 'student' | 'teacher';
    createdAt: Date;
    isReadBy: string[];
    totalUsersNotified: number;
}
