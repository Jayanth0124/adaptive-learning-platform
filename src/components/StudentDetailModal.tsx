import React from 'react';
import { StudentPerformance } from '../types';
import { X, Award, BarChart, Brain, TrendingUp } from 'lucide-react';

interface StudentDetailModalProps {
  performance: StudentPerformance & { studentName: string };
  onClose: () => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-gray-50 p-4 rounded-lg text-center">
        <Icon className="h-6 w-6 text-gray-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
);

const PerformanceBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700 capitalize">{label}</span>
            <span className="text-sm text-gray-600">{value.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full bg-${color}-500`} style={{ width: `${value}%` }} />
        </div>
    </div>
);


const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ performance, onClose }) => {
    const overallAccuracy = performance.totalQuestions > 0 ? (performance.correctAnswers / performance.totalQuestions) * 100 : 0;
    
    const difficultyStats = [
        { level: 'Easy', ...performance.difficultyDistribution.easy, color: 'green' },
        { level: 'Medium', ...performance.difficultyDistribution.medium, color: 'yellow' },
        { level: 'Hard', ...performance.difficultyDistribution.hard, color: 'red' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 sticky top-0 bg-white border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{performance.studentName}</h2>
                            <p className="text-sm text-gray-500">Detailed Performance Report</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <StatCard title="Overall Score" value={`${overallAccuracy.toFixed(1)}%`} icon={Award} />
                        <StatCard title="Total Answered" value={`${performance.totalQuestions}`} icon={BarChart} />
                        <StatCard title="Avg. Time" value={`${performance.averageTime.toFixed(1)}s`} icon={Brain} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-4 border">
                            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center"><TrendingUp className="h-5 w-5 mr-2" />Difficulty Breakdown</h3>
                            <div className="space-y-4">
                                {difficultyStats.map((stat) => {
                                    const accuracy = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
                                    return <PerformanceBar key={stat.level} label={stat.level} value={accuracy} color={stat.color} />;
                                })}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                            <h3 className="text-md font-semibold text-gray-900 mb-4">Category Performance</h3>
                             <div className="space-y-3">
                                {Object.keys(performance.categoryPerformance).length > 0 ? Object.entries(performance.categoryPerformance).map(([category, stats]) => {
                                const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                                return (
                                    <div key={category}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-700">{category}</span>
                                            <span className="text-sm text-gray-600">{stats.correct}/{stats.total}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${accuracy}%` }}/></div>
                                    </div>
                                );
                                }) : <p className="text-sm text-gray-500 col-span-full text-center py-4">No category data yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;