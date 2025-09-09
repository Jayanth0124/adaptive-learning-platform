import React from 'react';
import { StudentPerformance } from '../types';
import { Users, CheckCircle, XCircle, Percent, Hash } from 'lucide-react';

interface StudentAnalyticsTableProps {
  performances: (StudentPerformance & { studentName: string })[];
}

const StudentAnalyticsTable: React.FC<StudentAnalyticsTableProps> = ({ performances }) => {
  return (
    <div className="max-w-7xl mx-auto">
       <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Student Performance Analytics
        </h1>
        <p className="text-gray-600">Review quiz results and performance metrics for all students.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Incorrect</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Answered</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performances.map((p) => {
                const incorrectAnswers = p.totalQuestions - p.correctAnswers;
                const score = p.totalQuestions > 0 ? (p.correctAnswers / p.totalQuestions) * 100 : 0;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{p.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        score >= 80 ? 'bg-green-100 text-green-800' :
                        score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <Percent className="h-4 w-4 mr-1"/>{score.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-center">
                        <div className="flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 mr-1"/> {p.correctAnswers}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium text-center">
                        <div className="flex items-center justify-center">
                           <XCircle className="h-4 w-4 mr-1"/> {incorrectAnswers}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium text-center">
                        <div className="flex items-center justify-center">
                            <Hash className="h-4 w-4 mr-1"/> {p.totalQuestions}
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {performances.length === 0 && (
            <div className="text-center p-12 text-gray-500">
                No student performance data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsTable;
