import { Question, StudentPerformance, QuizAttempt } from '../types';

export class AdaptiveEngine {

  // Calculates a score based on overall accuracy, difficulty progression, and response time.
  calculateStudentFitScore(performance: StudentPerformance): number {
    const overallAccuracy = performance.totalQuestions > 0 ? performance.correctAnswers / performance.totalQuestions : 0;
    const difficultyBalance = this.calculateDifficultyBalance(performance);
    const timeEfficiency = this.calculateTimeEfficiency(performance);
    
    return Math.round((overallAccuracy * 0.5 + difficultyBalance * 0.3 + timeEfficiency * 0.2) * 100);
  }

  private calculateDifficultyBalance(performance: StudentPerformance): number {
    const { easy, medium, hard } = performance.difficultyDistribution;
    
    const easyRate = easy.total > 0 ? easy.correct / easy.total : 0;
    const mediumRate = medium.total > 0 ? medium.correct / medium.total : 0;
    const hardRate = hard.total > 0 ? hard.correct / hard.total : 0;
    
    const idealProgression = easyRate * 0.4 + mediumRate * 0.4 + hardRate * 0.2;
    return Math.min(idealProgression, 1);
  }

  private calculateTimeEfficiency(performance: StudentPerformance): number {
    const optimalTime = 30;
    const timeScore = Math.max(0, 1 - (performance.averageTime - optimalTime) / optimalTime);
    return Math.min(timeScore, 1);
  }

  // Updates the student's performance record after a quiz is completed.
  updatePerformance(
    currentPerformance: StudentPerformance, 
    attempts: QuizAttempt[], 
    attemptedQuestions: Question[] // Now uses the smaller list of questions from the actual quiz
  ): StudentPerformance {
    if (attempts.length === 0) return currentPerformance;

    const difficultyUpdates = JSON.parse(JSON.stringify(currentPerformance.difficultyDistribution));
    const categoryUpdates = JSON.parse(JSON.stringify(currentPerformance.categoryPerformance));

    attempts.forEach(attempt => {
      const question = attemptedQuestions.find(q => q.id === attempt.questionId);
      if (question) {
        // Update difficulty distribution
        const difficulty = question.difficulty as 'easy' | 'medium' | 'hard';
        difficultyUpdates[difficulty].total++;
        if (attempt.isCorrect) {
          difficultyUpdates[difficulty].correct++;
        }
        
        // Update category performance
        const category = question.category;
        if (!categoryUpdates[category]) {
          categoryUpdates[category] = { correct: 0, total: 0 };
        }
        categoryUpdates[category].total++;
        if (attempt.isCorrect) {
          categoryUpdates[category].correct++;
        }
      }
    });

    const totalQuestions = difficultyUpdates.easy.total + difficultyUpdates.medium.total + difficultyUpdates.hard.total;
    const correctAnswers = difficultyUpdates.easy.correct + difficultyUpdates.medium.correct + difficultyUpdates.hard.correct;

    const previousTotalTime = currentPerformance.averageTime * currentPerformance.totalQuestions;
    const newAttemptsTime = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
    const averageTime = totalQuestions > 0 ? (previousTotalTime + newAttemptsTime) / totalQuestions : 0;

    return {
      ...currentPerformance,
      totalQuestions,
      correctAnswers,
      averageTime,
      difficultyDistribution: difficultyUpdates,
      categoryPerformance: categoryUpdates,
      lastUpdated: new Date()
    };
  }
}