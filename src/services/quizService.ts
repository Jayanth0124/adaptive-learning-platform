import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Question, StudentPerformance, AdaptiveSettings } from '../types';
import { AIQuestionService } from './aiQuestionService';

// Helper function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper function to find the category with the lowest score
const findWeakestCategory = (performance: StudentPerformance): string => {
  let weakestCategory = 'General Knowledge'; // A sensible default topic
  let lowestScore = 1.0;

  const categories = Object.entries(performance.categoryPerformance);
  
  if (categories.length === 0) {
    return weakestCategory;
  }

  for (const [category, stats] of categories) {
    if (stats.total > 0) {
      const score = stats.correct / stats.total;
      if (score < lowestScore) {
        lowestScore = score;
        weakestCategory = category;
      }
    }
  }
  return weakestCategory;
};

// Helper function to determine the difficulty for the AI
const getAdaptiveDifficulty = (performance: StudentPerformance): 'easy' | 'medium' | 'hard' => {
  const overall = performance.totalQuestions > 0 ? performance.correctAnswers / performance.totalQuestions : 0.5;

  if (overall >= 0.8) {
    return 'hard'; // Student is doing great, challenge them.
  } else if (overall >= 0.6) {
    return 'medium'; // Student is doing well, give them a balanced quiz.
  } else {
    return 'easy'; // Student is struggling, reinforce with easier questions.
  }
};


export class QuizService {
  /**
   * Generates a new, unique quiz using an AI based on student performance.
   * This is the new core function for the adaptive experience.
   */
  static async generateAdaptiveQuizWithAI(
    performance: StudentPerformance,
    settings: AdaptiveSettings
  ): Promise<Question[]> {
    
    // 1. Determine the difficulty based on overall performance
    const difficulty = getAdaptiveDifficulty(performance);
    
    // 2. Find the student's weakest topic
    const topic = findWeakestCategory(performance);

    // 3. Generate a fresh set of questions using the AI
    // We use the topic as both the topic and the category for consistency.
    const newQuestions = await AIQuestionService.generateQuestions(
      topic,
      settings.poolSize, // The number of questions is based on system settings
      difficulty,
      topic 
    );

    // The AI service returns questions without an 'id', so we add a temporary one.
    const quiz = newQuestions.map((q, index) => ({
      ...q,
      id: `ai-gen-${Date.now()}-${index}`
    }));

    return shuffleArray(quiz);
  }

  /**
   * Fetches a standard quiz from the Firestore database.
   * This is used for the very first quiz a student takes.
   */
  static async generateInitialQuiz(settings: AdaptiveSettings): Promise<Question[]> {
    // For a new student, fetch a fixed number of questions from the database
    const easyCount = Math.round(settings.poolSize * 0.4);
    const mediumCount = Math.round(settings.poolSize * 0.4);
    const hardCount = settings.poolSize - easyCount - mediumCount;

    const [easy, medium, hard] = await Promise.all([
      fetchQuestionsByDifficulty('easy', easyCount),
      fetchQuestionsByDifficulty('medium', mediumCount),
      fetchQuestionsByDifficulty('hard', hardCount)
    ]);
    
    const quiz = [...easy, ...medium, ...hard];
    return shuffleArray(quiz);
  }
}

// Private helper to fetch questions from Firestore by difficulty
const fetchQuestionsByDifficulty = async (difficulty: 'easy' | 'medium' | 'hard', count: number): Promise<Question[]> => {
    if (count <= 0) return [];
    const q = query(
        collection(db, 'questions'),
        where('difficulty', '==', difficulty),
        limit(count)
    );
    const snapshot = await getDocs(q);
    // Ensure we add the document ID to our question object
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Question[];
};