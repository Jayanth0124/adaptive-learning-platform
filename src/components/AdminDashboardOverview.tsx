import React from 'react';
import { User } from '../types';
import { QuizCompletion } from '../services/performanceService';
import { Users, UserPlus, BookCopy, CheckSquare } from 'lucide-react';

interface AdminDashboardOverviewProps {
    stats: { userCount: number; studentCount: number; questionCount: number };
    recentUsers: User[];
    recentCompletions: QuizCompletion[];
}

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: number, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ stats, recentUsers, recentCompletions }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard icon={Users} title="Total Users" value={stats.userCount} color="blue" />
                <StatCard icon={UserPlus} title="Student Accounts" value={stats.studentCount} color="green" />
                <StatCard icon={BookCopy} title="Total Questions" value={stats.questionCount} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><UserPlus className="h-5 w-5 mr-2 text-gray-500" />Recent Signups</h2>
                    <ul className="divide-y divide-gray-200">
                        {recentUsers.map(user => (
                            <li key={user.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.username}</p>
                                </div>
                                <span className="text-xs text-gray-500">{new Date(user.createdAt!).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><CheckSquare className="h-5 w-5 mr-2 text-gray-500"/>Recent Quiz Completions</h2>
                     <ul className="divide-y divide-gray-200">
                        {recentCompletions.map(comp => (
                            <li key={comp.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{comp.studentName}</p>
                                    <p className="text-xs text-gray-500">{comp.totalQuestions} Questions</p>
                                </div>
                                <span className="text-sm font-semibold">{comp.score.toFixed(1)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardOverview;