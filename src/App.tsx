import React, { useState, useEffect } from 'react';
import { Question, QuizAttempt, StudentPerformance, AdaptiveSettings, User, AuthState } from './types';
import { AdaptiveEngine } from './services/adaptiveEngine';
import { AuthService } from './services/authService';
import { PerformanceService } from './services/performanceService';
import { QuizService } from './services/quizService';
import { SettingsService } from './services/settingsService';
import { Notification, NotificationService } from './services/notificationService';

import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Navigation from './components/Navigation';
import QuizInterface from './components/QuizInterface';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import StudentHome from './components/StudentHome';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDetailModal from './components/StudentDetailModal'; // Ensure this is imported if used directly here, though it's likely in a sub-component

const getInitialView = (auth: AuthState): string => {
    if (auth.isAuthenticated) {
        if (AuthService.isAdmin(auth)) return 'admin-dashboard';
        if (AuthService.isTeacher(auth)) return 'teacher-analytics'; // Default view for teachers
        if (AuthService.isStudent(auth)) return 'home';
    }
    return 'login';
};

function App() {
  const [authState, setAuthState] = useState(AuthService.getCurrentAuth());
  const [currentView, setCurrentView] = useState(() => getInitialView(authState));
  const [performance, setPerformance] = useState<StudentPerformance | null>(null);
  const [settings, setSettings] = useState<AdaptiveSettings | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [studentFitScore, setStudentFitScore] = useState(0);
  const [showSignup, setShowSignup] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [allStudentPerformances, setAllStudentPerformances] = useState<(StudentPerformance & { studentName: string })[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false); // To show a loading state

  const adaptiveEngine = new AdaptiveEngine();

  useEffect(() => {
    const fetchInitialData = async () => {
        const appSettings = await SettingsService.getSettings();
        setSettings(appSettings);

        if (authState.isAuthenticated && authState.user) {
            const usersData = await AuthService.getUsers();
            setUsers(usersData);
            const unread = await NotificationService.getUnreadNotifications(authState.user);
            setUnreadNotifications(unread);

            if (AuthService.isAdmin(authState) || AuthService.isTeacher(authState)) {
                const performances = await PerformanceService.getAllStudentPerformances(usersData);
                setAllStudentPerformances(performances);
            }
            
            if (AuthService.isStudent(authState)) {
                const perfData = await PerformanceService.getPerformance(authState.user.id);
                setPerformance(perfData);
            }
        }
    };
    fetchInitialData();
  }, [authState]);
  
  useEffect(() => {
    if (performance && settings && performance.totalQuestions >= settings.minQuestionsBeforeAdaptation) {
      const fitScore = adaptiveEngine.calculateStudentFitScore(performance);
      setStudentFitScore(fitScore);
    } else {
      setStudentFitScore(0);
    }
  }, [performance, settings]);

  useEffect(() => {
    const generateQuizForView = async () => {
        if (currentView === 'quiz' && performance && settings) {
            setIsQuizLoading(true);
            setCurrentQuiz([]); // Clear previous quiz
            
            let quizQuestions: Question[];
            
            // If the student has answered enough questions, use the new AI generation
            if (performance.totalQuestions >= settings.minQuestionsBeforeAdaptation) {
                console.log("Generating adaptive quiz with AI...");
                quizQuestions = await QuizService.generateAdaptiveQuizWithAI(performance, settings);
            } else {
                // Otherwise, give them a standard quiz from the database
                console.log("Generating initial standard quiz...");
                quizQuestions = await QuizService.generateInitialQuiz(settings);
            }
            
            setCurrentQuiz(quizQuestions);
            setIsQuizLoading(false);
        }
    };
    generateQuizForView();
  }, [currentView, performance, settings]);

  const handleLogin = async (newAuthState: AuthState) => {
    setCurrentView(getInitialView(newAuthState));
    setAuthState(newAuthState);
    setShowSignup(false);
  };

  const handleSignup = async (username: string, name: string, pass: string) => {
    const newAuthState = await AuthService.signup(username, name, pass);
    if (newAuthState) {
      await handleLogin(newAuthState);
    } else {
      alert('Username already exists!');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setAuthState({ isAuthenticated: false, user: null });
    setPerformance(null);
    setCurrentView('login');
    setShowSignup(false);
  };
  
  const handleCreateUser = async (name: string, username: string, pass: string, role: 'student' | 'teacher'): Promise<boolean> => {
    const newUser = await AuthService.createUser(name, username, pass, role);
    if (newUser) {
      setUsers(currentUsers => [...currentUsers, newUser]);
      return true;
    }
    return false;
  };
  
  const handleUpdateUserRole = async (userId: string, newRole: 'student' | 'teacher') => {
      await AuthService.updateUserRole(userId, newRole);
      setUsers(currentUsers => currentUsers.map(u => u.id === userId ? {...u, role: newRole} : u));
  };

  const handleDeleteUser = async (userId: string) => {
    if (await AuthService.deleteUser(userId)) {
        setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
    }
  };
  
  const handleUpdateSettings = async (newSettings: Partial<AdaptiveSettings>) => {
    await SettingsService.updateSettings(newSettings);
    setSettings(prev => prev ? {...prev, ...newSettings} : null);
  };

  const handleQuizComplete = async (attempts: QuizAttempt[]) => {
    if (!authState.user || !performance) return;
    
    const updatedPerformance = adaptiveEngine.updatePerformance(performance, attempts, currentQuiz);
    
    await PerformanceService.updatePerformance(authState.user.id, updatedPerformance);
    await PerformanceService.logQuizCompletion(authState.user.id, authState.user.name, updatedPerformance);
    setPerformance(updatedPerformance);
    setCurrentView('dashboard');
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleMarkAsRead = async (notificationIds: string[]) => {
      if (authState.user) {
          await NotificationService.markNotificationsAsRead(notificationIds, authState.user.id);
          setUnreadNotifications([]);
      }
  };

  if (!authState.isAuthenticated) {
    if (showSignup) return <SignupPage onSignup={handleSignup} onBackToLogin={() => setShowSignup(false)} />;
    return <LoginPage onLogin={handleLogin} onNavigateToSignup={() => setShowSignup(true)} />;
  }
  
  if (!settings) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isAdmin = AuthService.isAdmin(authState);
  const isStudent = AuthService.isStudent(authState);
  const isTeacher = AuthService.isTeacher(authState);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation 
        currentView={currentView} 
        onViewChange={handleViewChange}
        authState={authState}
        onLogout={handleLogout}
        unreadNotifications={unreadNotifications}
        onMarkAsRead={handleMarkAsRead}
      />
      
      <div className="flex-1">
        {isAdmin && authState.user ? (
            <AdminDashboard 
                currentUser={authState.user}
                users={users} 
                onDeleteUser={handleDeleteUser} 
                onCreateUser={handleCreateUser}
                onUpdateUserRole={handleUpdateUserRole}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
            />
        ) : (
            <main className="p-4 md:p-6">
                {isTeacher && authState.user && (
                  <TeacherDashboard
                    currentUser={authState.user}
                    users={users}
                    allStudentPerformances={allStudentPerformances}
                    currentView={currentView}
                  />
                )}
                {isStudent && currentView === 'home' && authState.user && (
                  <StudentHome 
                    onStartQuiz={() => handleViewChange('quiz')}
                    onViewDashboard={() => handleViewChange('dashboard')}
                    performance={performance}
                    currentUser={authState.user}
                  />
                )}
                {isStudent && currentView === 'quiz' && (
                  isQuizLoading 
                    ? <div className="text-center p-10">Generating your personalized quiz...</div>
                    : <QuizInterface questions={currentQuiz} onQuizComplete={handleQuizComplete} performance={performance!} />
                )}
                {isStudent && currentView === 'dashboard' && performance && (
                  <Dashboard performance={performance} studentFitScore={studentFitScore} />
                )}
            </main>
        )}
      </div>
    </div>
  );
}

export default App;
