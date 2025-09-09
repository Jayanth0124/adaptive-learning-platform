import React from 'react';
import { StudentPerformance } from '../types';
import { BarChart3, TrendingUp, Clock, Target, Award, Brain } from 'lucide-react';

interface DashboardProps {
  performance: StudentPerformance;
  studentFitScore: number;
}

const Dashboard: React.FC<DashboardProps> = ({ performance, studentFitScore }) => {
  const overallAccuracy = performance.totalQuestions > 0 
    ? (performance.correctAnswers / performance.totalQuestions) * 100 
    : 0;

  const difficultyStats = [
    { level: 'Easy', correct: performance.difficultyDistribution.easy.correct, total: performance.difficultyDistribution.easy.total, color: 'green' },
    { level: 'Medium', correct: performance.difficultyDistribution.medium.correct, total: performance.difficultyDistribution.medium.total, color: 'yellow' },
    { level: 'Hard', correct: performance.difficultyDistribution.hard.correct, total: performance.difficultyDistribution.hard.total, color: 'red' }
  ];

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'green' };
    if (score >= 80) return { label: 'Good', color: 'blue' };
    if (score >= 70) return { label: 'Average', color: 'yellow' };
    if (score >= 60) return { label: 'Needs Work', color: 'orange' };
    return { label: 'Needs Improvement', color: 'red' };
  };

  const performanceLevel = getPerformanceLevel(overallAccuracy);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
        <p className="text-gray-600">Track your progress and performance analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border flex items-center">
            <div className="bg-blue-100 p-3 rounded-full"><Target className="h-6 w-6 text-blue-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Overall Accuracy</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{overallAccuracy.toFixed(1)}%</p></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border flex items-center">
            <div className="bg-green-100 p-3 rounded-full"><BarChart3 className="h-6 w-6 text-green-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Questions Answered</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{performance.totalQuestions}</p></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full"><Clock className="h-6 w-6 text-yellow-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Avg Time/Question</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{performance.averageTime.toFixed(1)}s</p></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border flex items-center">
            <div className="bg-purple-100 p-3 rounded-full"><Brain className="h-6 w-6 text-purple-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Fit Score</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{studentFitScore}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Award className="h-5 w-5 mr-2" />Performance Level</h3>
          <div className="text-center py-8">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-${performanceLevel.color}-100 text-${performanceLevel.color}-800`}>
              {performanceLevel.label}
            </div>
            <p className="mt-2 text-gray-600">Based on your overall accuracy of {overallAccuracy.toFixed(1)}%</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><TrendingUp className="h-5 w-5 mr-2" />Difficulty Breakdown</h3>
          <div className="space-y-4">
            {difficultyStats.map((stat) => {
              const accuracy = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
              return (
                <div key={stat.level}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{stat.level}</span>
                    <span className="text-sm text-gray-600">{stat.correct}/{stat.total} ({accuracy.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full bg-${stat.color}-500`} style={{ width: `${accuracy}%` }}/></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(performance.categoryPerformance).length > 0 ? Object.entries(performance.categoryPerformance).map(([category, stats]) => {
              const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
              return (
                <div key={category} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                  <div className="flex justify-between items-center mb-2"><span className="text-sm text-gray-600">Accuracy</span><span className="text-sm font-medium">{accuracy.toFixed(1)}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${accuracy}%` }}/></div>
                  <p className="text-xs text-gray-500">{stats.correct}/{stats.total} questions</p>
                </div>
              );
            }) : <p className="text-sm text-gray-500 col-span-full">No category data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;