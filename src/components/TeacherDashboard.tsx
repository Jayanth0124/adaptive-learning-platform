import React, { useState } from 'react';
import StudentAnalyticsTable from './StudentAnalyticsTable';
import NotificationManager from './NotificationManager';
import TeacherQuestionManager from './TeacherQuestionManager'; // Using the correct component
import { StudentPerformance, User } from '../types';

interface TeacherDashboardProps {
  currentUser: User;
  users: User[];
  allStudentPerformances: (StudentPerformance & { studentName: string })[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser, users, allStudentPerformances }) => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="max-w-7xl mx-auto">
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex flex-wrap -mb-px space-x-2 sm:space-x-4">
                <button onClick={() => setActiveTab('analytics')} className={`whitespace-nowrap py-2 px-3 text-sm font-medium ${activeTab === 'analytics' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Student Analytics
                </button>
                <button onClick={() => setActiveTab('questions')} className={`whitespace-nowrap py-2 px-3 text-sm font-medium ${activeTab === 'questions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Question Management
                </button>
                <button onClick={() => setActiveTab('notifications')} className={`whitespace-nowrap py-2 px-3 text-sm font-medium ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Send Notifications
                </button>
            </nav>
        </div>

        {activeTab === 'analytics' && <StudentAnalyticsTable performances={allStudentPerformances} />}
        {activeTab === 'questions' && <TeacherQuestionManager />}
        {activeTab === 'notifications' && <NotificationManager currentUser={currentUser} />}
    </div>
  );
};

export default TeacherDashboard;