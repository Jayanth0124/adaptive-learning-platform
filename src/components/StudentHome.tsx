import React from 'react';
import { BookOpen, Target, Hash, Brain } from 'lucide-react';
import { StudentPerformance, User } from '../types';

interface StudentHomeProps {
  onStartQuiz: () => void;
  onViewDashboard: () => void;
  performance: StudentPerformance | null;
  currentUser: User;
}

const findWeakestCategory = (performance: StudentPerformance | null): string => {
    if (!performance || Object.keys(performance.categoryPerformance).length === 0) {
        return 'General Knowledge'; // Default topic if no data is available
    }

    let weakestCategory = 'General Knowledge';
    let lowestScore = 1.0;

    for (const [category, stats] of Object.entries(performance.categoryPerformance)) {
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


const StudentHome: React.FC<StudentHomeProps> = ({ onStartQuiz, onViewDashboard, performance, currentUser }) => {
  const hasTakenQuizBefore = performance && performance.totalQuestions > 0;
  const overallAccuracy = performance && performance.totalQuestions > 0
    ? (performance.correctAnswers / performance.totalQuestions) * 100
    : 0;
  
  const weakestSubject = findWeakestCategory(performance);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {currentUser.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">Let's continue your learning journey.</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {hasTakenQuizBefore ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{overallAccuracy.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Overall Score</p>
                </div>
                 <div className="bg-green-50 p-4 rounded-lg">
                    <Hash className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{performance.totalQuestions}</p>
                    <p className="text-sm text-gray-600">Questions Answered</p>
                </div>
                 <div className="bg-red-50 p-4 rounded-lg">
                    <Brain className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{weakestSubject}</p>
                    <p className="text-sm text-gray-600">Needs Improvement</p>
                </div>
            </div>

            <div className="text-center bg-gray-50 p-6 rounded-lg">
                 <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Recommended Next Step
                </h2>
                <p className="text-gray-600 mb-6">
                    Let's focus on your weakest area: <span className="font-bold">{weakestSubject}</span>. A new set of questions is ready for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={onStartQuiz}
                      className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                    >
                      Start Recommended Quiz
                    </button>
                    <button
                      onClick={onViewDashboard}
                      className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors text-lg font-semibold"
                    >
                      View Full Progress
                    </button>
                </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Ready to Test Your Knowledge?
            </h1>
            <p className="text-gray-600 mb-8">
              Click the button below to start your first quiz and discover your strengths.
            </p>
            <button
              onClick={onStartQuiz}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Start First Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;