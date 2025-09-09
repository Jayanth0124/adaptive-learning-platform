import React from 'react';
import { BookOpen, BarChart3 } from 'lucide-react';
import { StudentPerformance } from '../types';

interface StudentHomeProps {
  onStartQuiz: () => void;
  onViewDashboard: () => void;
  performance: StudentPerformance | null;
}

const StudentHome: React.FC<StudentHomeProps> = ({ onStartQuiz, onViewDashboard, performance }) => {
  const hasCompleted = performance?.hasCompletedQuiz;

  return (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="bg-white rounded-lg shadow-lg p-8 mt-10">
        {hasCompleted ? (
          <>
            <BarChart3 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              You Have Completed the Quiz
            </h1>
            <p className="text-gray-600 mb-8">
              You can review your results and performance on your dashboard.
            </p>
            <button
              onClick={onViewDashboard}
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              View My Results
            </button>
          </>
        ) : (
          <>
            <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
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