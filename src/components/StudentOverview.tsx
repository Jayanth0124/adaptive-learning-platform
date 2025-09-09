import React from 'react';
import { StudentPerformance } from '../types';
import { Users, TrendingUp, Clock, Target, Award, BookOpen } from 'lucide-react';

interface StudentOverviewProps {
  performance: StudentPerformance;
  studentFitScore: number;
}

const StudentOverview: React.FC<StudentOverviewProps> = ({ performance, studentFitScore }) => {
  const overallAccuracy = performance.totalQuestions > 0 
    ? (performance.correctAnswers / performance.totalQuestions) * 100 
    : 0;

  const getRecommendations = () => {
    const recommendations = [];
    
    if (overallAccuracy < 60) {
      recommendations.push({
        type: 'warning',
        message: 'Focus on foundational concepts before moving to advanced topics',
        action: 'Review easy-level questions'
      });
    }
    
    if (performance.averageTime > 45) {
      recommendations.push({
        type: 'info',
        message: 'Consider practicing time management techniques',
        action: 'Take timed practice quizzes'
      });
    }
    
    if (performance.difficultyDistribution.easy.total > 0 && 
        (performance.difficultyDistribution.easy.correct / performance.difficultyDistribution.easy.total) > 0.9) {
      recommendations.push({
        type: 'success',
        message: 'Strong foundation! Ready for more challenging material',
        action: 'Increase medium and hard difficulty questions'
      });
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Overview</h1>
        <p className="text-gray-600">Comprehensive analysis and learning recommendations</p>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 border mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Performance Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-1">{overallAccuracy.toFixed(1)}%</div>
            <div className="text-sm text-blue-800">Overall Accuracy</div>
            <div className="text-xs text-blue-600 mt-1">
              {performance.correctAnswers}/{performance.totalQuestions} questions
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-1">{studentFitScore}</div>
            <div className="text-sm text-purple-800">Student Fit Score</div>
            <div className="text-xs text-purple-600 mt-1">Adaptive learning metric</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-1">{performance.averageTime.toFixed(1)}s</div>
            <div className="text-sm text-green-800">Avg Response Time</div>
            <div className="text-xs text-green-600 mt-1">Per question</div>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Learning Progress
          </h3>
          
          <div className="space-y-4">
            {['easy', 'medium', 'hard'].map((difficulty) => {
              const stats = performance.difficultyDistribution[difficulty as keyof typeof performance.difficultyDistribution];
              const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
              const isStrong = accuracy >= 80;
              const isDeveloping = accuracy >= 60 && accuracy < 80;
              const needsWork = accuracy < 60;
              
              return (
                <div key={difficulty} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">{difficulty}</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">
                        {stats.correct}/{stats.total}
                      </span>
                      {isStrong && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                      {isDeveloping && <div className="w-2 h-2 bg-yellow-500 rounded-full" />}
                      {needsWork && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className={`h-2 rounded-full ${
                        isStrong ? 'bg-green-500' :
                        isDeveloping ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{accuracy.toFixed(1)}% accuracy</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Category Strengths
          </h3>
          
          <div className="space-y-3">
            {Object.entries(performance.categoryPerformance)
              .sort((a, b) => {
                const aAccuracy = a[1].total > 0 ? (a[1].correct / a[1].total) : 0;
                const bAccuracy = b[1].total > 0 ? (b[1].correct / b[1].total) : 0;
                return bAccuracy - aAccuracy;
              })
              .map(([category, stats]) => {
                const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                return (
                  <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{accuracy.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">{stats.correct}/{stats.total}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Personalized Recommendations
          </h3>
          
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.type === 'success' ? 'bg-green-50 border-green-500' :
                  rec.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      rec.type === 'success' ? 'text-green-800' :
                      rec.type === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {rec.message}
                    </p>
                    <p className={`text-xs mt-1 ${
                      rec.type === 'success' ? 'text-green-600' :
                      rec.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      Recommended action: {rec.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOverview;