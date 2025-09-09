import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Question, StudentPerformance, AdaptiveSettings } from '../types';

// Helper function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Fetches a specific number of questions for a given difficulty
const fetchQuestionsByDifficulty = async (difficulty: 'easy' | 'medium' | 'hard', count: number): Promise<Question[]> => {
    if (count <= 0) return [];
    const q = query(
        collection(db, 'questions'),
        where('difficulty', '==', difficulty),
        limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Question[];
};

const calculateAdaptiveDifficultyRatio = (performance: StudentPerformance): { easy: number; medium: number; hard: number } => {
    const overall = performance.totalQuestions > 0 ? performance.correctAnswers / performance.totalQuestions : 0;
    
    if (overall >= 0.8) {
      return { easy: 0.2, medium: 0.4, hard: 0.4 };
    } else if (overall >= 0.6) {
      return { easy: 0.3, medium: 0.5, hard: 0.2 };
    } else {
      return { easy: 0.5, medium: 0.4, hard: 0.1 };
    }
};

export class QuizService {
  static async generateQuizQuestions(
    performance: StudentPerformance,
    settings: AdaptiveSettings
  ): Promise<Question[]> {
    let quiz: Question[] = [];

    if (performance.totalQuestions < settings.minQuestionsBeforeAdaptation) {
      // --- Initial Quiz Generation (Fixed number of questions) ---
      const [easy, medium, hard] = await Promise.all([
        fetchQuestionsByDifficulty('easy', 4),
        fetchQuestionsByDifficulty('medium', 4),
        fetchQuestionsByDifficulty('hard', 2)
      ]);
      quiz = [...easy, ...medium, ...hard];

    } else {
      // --- Adaptive Quiz Generation (Based on performance) ---
      const ratio = calculateAdaptiveDifficultyRatio(performance);
      const easyCount = Math.round(settings.poolSize * ratio.easy);
      const mediumCount = Math.round(settings.poolSize * ratio.medium);
      const hardCount = settings.poolSize - easyCount - mediumCount;

      const [easy, medium, hard] = await Promise.all([
        fetchQuestionsByDifficulty('easy', easyCount),
        fetchQuestionsByDifficulty('medium', mediumCount),
        fetchQuestionsByDifficulty('hard', hardCount)
      ]);
      quiz = [...easy, ...medium, ...hard];
    }
    
    return shuffleArray(quiz);
  }
}