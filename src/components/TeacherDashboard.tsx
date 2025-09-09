import React from 'react';
import StudentAnalyticsTable from './StudentAnalyticsTable';
import NotificationManager from './NotificationManager';
import TeacherQuestionManager from './TeacherQuestionManager';
import { StudentPerformance, User } from '../types';

interface TeacherDashboardProps {
  currentUser: User;
  users: User[];
  allStudentPerformances: (StudentPerformance & { studentName: string })[];
  currentView: string; // The view is now controlled by the App
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser, users, allStudentPerformances, currentView }) => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* The internal tab navigation has been completely removed. */}

      {/* Conditionally render content based on the currentView prop from the main navigation */}
      {currentView === 'teacher-analytics' && <StudentAnalyticsTable performances={allStudentPerformances} />}
      {currentView === 'teacher-questions' && <TeacherQuestionManager />}
      {currentView === 'teacher-notifications' && <NotificationManager currentUser={currentUser} />}
    </div>
  );
};

export default TeacherDashboard;