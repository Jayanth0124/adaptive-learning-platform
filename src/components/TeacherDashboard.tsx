import React, { useState } from 'react';
import StudentAnalyticsTable from './StudentAnalyticsTable';
import NotificationManager from './NotificationManager';
import AdminQuestionManager from './AdminQuestionManager'; // Use the full-featured component
import { StudentPerformance, User } from '../types';

interface TeacherDashboardProps {
  currentUser: User;
  users: User[];
  allStudentPerformances: (StudentPerformance & { studentName: string })[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser, users, allStudentPerformances }) => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="max-w-7xl mx-auto p-6">
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-4">
                <button onClick={() => setActiveTab('analytics')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'analytics' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Student Analytics
                </button>
                <button onClick={() => setActiveTab('questions')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'questions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Question Management
                </button>
                <button onClick={() => setActiveTab('notifications')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Send Notifications
                </button>
            </nav>
        </div>

        {activeTab === 'analytics' && <StudentAnalyticsTable performances={allStudentPerformances} />}
        {/* Pass the necessary props to the question manager */}
        {activeTab === 'questions' && <AdminQuestionManager users={users} onQuestionUpdate={() => {}} />}
        {activeTab === 'notifications' && <NotificationManager currentUser={currentUser} />}
    </div>
  );
};

export default TeacherDashboard;    