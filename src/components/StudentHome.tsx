import React from 'react';
import { BookOpen, BarChart3, RotateCcw } from 'lucide-react';
import { StudentPerformance } from '../types';

interface StudentHomeProps {
  onStartQuiz: () => void;
  onViewDashboard: () => void;
  performance: StudentPerformance | null;
}

const StudentHome: React.FC<StudentHomeProps> = ({ onStartQuiz, onViewDashboard, performance }) => {
  const hasTakenQuizBefore = performance && performance.totalQuestions > 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-center">
      <div className="bg-white rounded-lg shadow-lg p-8 mt-10">
        {hasTakenQuizBefore ? (
          <>
            <RotateCcw className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Ready for Another Round?
            </h1>
            <p className="text-gray-600 mb-8">
              Keep practicing to improve your score and master the material.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onStartQuiz}
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                >
                  Take Another Quiz
                </button>
                <button
                  onClick={onViewDashboard}
                  className="bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors text-lg font-semibold"
                >
                  View My Progress
                </button>
            </div>
          </>
        ) : (
          <>
            <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome to Your Learning Journey
            </h1>
            <p className="text-gray-600 mb-8">
              Ready to test your knowledge? Click the button below to start the quiz.
            </p>
            <button
              onClick={onStartQuiz}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Start Quiz
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentHome;
