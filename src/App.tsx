// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuizAttempt, StudentPerformance, AdaptiveSettings, User, AuthState } from './types';
import { AdaptiveEngine } from './services/adaptiveEngine';
import { AuthService } from './services/authService';
import { PerformanceService } from './services/performanceService';
import { QuizService } from './services/quizService';
import { SettingsService } from './services/settingsService';
import { Notification, NotificationService } from './services/notificationService';

// Import your components
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Navigation from './components/Navigation';
import QuizInterface from './components/QuizInterface';
import Dashboard from './components/Dashboard'; // Student Dashboard
import AdminDashboard from './components/AdminDashboard';
import StudentHome from './components/StudentHome';
import TeacherDashboard from './components/TeacherDashboard';

// Helper to determine initial view based on auth state
const getInitialView = (auth: AuthState): string => {
    if (auth.isAuthenticated) {
        if (AuthService.isAdmin(auth)) return 'admin-dashboard';
        if (AuthService.isTeacher(auth)) return 'teacher-analytics'; // Changed this from 'teacher-dashboard'
        if (AuthService.isStudent(auth)) return 'home';
    }
    return 'login';
};

function App() {
  const [authState, setAuthState] = useState<AuthState>(AuthService.getCurrentAuth());
  const [settings, setSettings] = useState<AdaptiveSettings | null>(null);
  const [currentView, setCurrentView] = useState('loading'); // Initial view is 'loading'
  const [isAppLoading, setIsAppLoading] = useState(true);

  // States specific to authenticated users (will be loaded after auth)
  const [performance, setPerformance] = useState<StudentPerformance | null>(null);
  const [studentFitScore, setStudentFitScore] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [allStudentPerformances, setAllStudentPerformances] = useState<(StudentPerformance & { studentName: string })[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [showSignup, setShowSignup] = useState(false); // To toggle between login/signup pages

  const adaptiveEngine = new AdaptiveEngine();

  // --- Initial App Load and Data Fetching ---
  useEffect(() => {
    const initializeApp = async () => {
      setIsAppLoading(true);
      try {
        // Step 1: Always fetch settings first, guaranteed to return an object (or default)
        const appSettings = await SettingsService.getSettings();
        setSettings(appSettings);

        // Step 2: Check current authentication state
        const currentAuth = AuthService.getCurrentAuth();
        setAuthState(currentAuth);

        // Step 3: If authenticated, fetch user-specific data based on role
        if (currentAuth.isAuthenticated && currentAuth.user) {
          // Fetch all users (admins/teachers need this for management)
          const allUsers = await AuthService.getUsers();
          setUsers(allUsers);

          // Fetch unread notifications for the current user
          const unread = await NotificationService.getUnreadNotifications(currentAuth.user);
          setUnreadNotifications(unread);

          // Fetch all student performances if admin or teacher
          if (AuthService.isAdmin(currentAuth) || AuthService.isTeacher(currentAuth)) {
            const performances = await PerformanceService.getAllStudentPerformances(allUsers);
            setAllStudentPerformances(performances);
          }

          // Fetch current student's performance data if student
          if (AuthService.isStudent(currentAuth)) {
            const perfData = await PerformanceService.getPerformance(currentAuth.user.id);
            setPerformance(perfData);
          }
        }

        // Step 4: Set the initial view once everything is loaded
        setCurrentView(getInitialView(currentAuth));

      } catch (error) {
        console.error("Failed to initialize app:", error);
        // Fallback: If critical data fetch fails, redirect to login
        setCurrentView('login');
        setAuthState({ isAuthenticated: false, user: null });
        alert("Failed to load initial application data. Please try again or contact support.");
      } finally {
        setIsAppLoading(false); // App is no longer loading
      }
    };

    initializeApp();
  }, [authState.isAuthenticated]); // Re-run if auth state changes (login/logout)

  // --- Effects for Quiz Logic ---
  useEffect(() => {
    if (performance && settings && performance.totalQuestions >= settings.minQuestionsBeforeAdaptation) {
      const fitScore = adaptiveEngine.calculateStudentFitScore(performance);
      setStudentFitScore(fitScore);
    } else {
      setStudentFitScore(0);
    }
  }, [performance, settings]); // adaptiveEngine is stateless, no need for dependency

  const generateQuizForView = useCallback(async () => {
      if (currentView === 'quiz' && performance && settings && authState.user) {
          setIsQuizLoading(true);
          setCurrentQuiz([]); // Clear previous quiz questions

          let quizQuestions: Question[];

          if (performance.totalQuestions >= settings.minQuestionsBeforeAdaptation) {
              quizQuestions = await QuizService.generateAdaptiveQuizWithAI(performance, settings);
          } else {
              quizQuestions = await QuizService.generateInitialQuiz(settings);
          }

          setCurrentQuiz(quizQuestions);
          setIsQuizLoading(false);
      }
  }, [currentView, performance, settings, authState.user]); // adaptiveEngine is stateless

  useEffect(() => {
      // Only generate quiz if the current view is 'quiz' and other conditions are met
      // This is managed by generateQuizForView useCallback
      if (currentView === 'quiz' && !isQuizLoading && currentQuiz.length === 0) {
        generateQuizForView();
      }
  }, [currentView, isQuizLoading, currentQuiz.length, generateQuizForView]);


  // --- Handlers for User Actions ---

  const handleLogin = (newAuthState: AuthState) => {
    setAuthState(newAuthState);
    setShowSignup(false);
    // currentView will be updated by the main useEffect when authState changes
  };

  const handleSignup = async (email: string, password: string, name: string, username: string) => {
    // AuthService.signup handles its own alerts for username/email taken or weak password
    const newAuthState = await AuthService.signup(email, password, name, username);
    if (newAuthState) {
      handleLogin(newAuthState);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setAuthState({ isAuthenticated: false, user: null });
    setPerformance(null);
    setCurrentView('login');
    setShowSignup(false);
    // Clear any user-specific data that might persist
    setUsers([]);
    setAllStudentPerformances([]);
    setUnreadNotifications([]);
    setCurrentQuiz([]);
  };

  const handleCreateUser = async (name: string, username: string, email:string, pass: string, role: 'student' | 'teacher'): Promise<boolean> => {
    const newAuthState = await AuthService.signup(email, pass, name, username); // Re-use signup logic
    if (newAuthState && newAuthState.user) {
        // Update user's role if it's not the default 'student'
        if (newAuthState.user.role !== role) {
            await AuthService.updateUserRole(newAuthState.user.id, role);
            const updatedUser = {...newAuthState.user, role: role};
            setUsers(currentUsers => [...currentUsers, updatedUser]);
            return true;
        }
        setUsers(currentUsers => [...currentUsers, newAuthState.user!]); // User is guaranteed here
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
        setAllStudentPerformances(currentPerf => currentPerf.filter(p => p.id !== userId));
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<AdaptiveSettings>) => {
    await SettingsService.updateSettings(newSettings);
    const updatedSettings = await SettingsService.getSettings(); // Re-fetch to ensure consistency
    setSettings(updatedSettings);
  };

  const handleQuizComplete = async (attempts: QuizAttempt[]) => {
    if (!authState.user || !performance || !settings) {
        console.error("Missing user, performance, or settings for quiz completion.");
        alert("Could not save quiz. Missing user data.");
        return;
    }

    // Update local performance object first
    const updatedPerformance = adaptiveEngine.updatePerformance(performance, attempts, currentQuiz);
    setPerformance(updatedPerformance); // Update state immediately for responsiveness

    // Save to Firestore
    await PerformanceService.updatePerformance(authState.user.id, updatedPerformance);
    await PerformanceService.logQuizCompletion(authState.user.id, authState.user.name, updatedPerformance);

    setCurrentView('dashboard'); // Redirect to student dashboard after quiz
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleMarkAsRead = async (notificationIds: string[]) => {
      if (authState.user) {
          await NotificationService.markNotificationsAsRead(notificationIds, authState.user.id);
          // Re-fetch unread notifications to update the count
          const unread = await NotificationService.getUnreadNotifications(authState.user);
          setUnreadNotifications(unread);
      }
  };

  // --- Main Render Logic ---
  if (isAppLoading || settings === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-gray-700">Loading Application...</p>
      </div>
    );
  }

  // Once settings are loaded and app is not loading, render the appropriate view
  if (!authState.isAuthenticated) {
    if (showSignup) return <SignupPage onSignup={handleSignup} onBackToLogin={() => setShowSignup(false)} settings={settings} />;
    return <LoginPage onLogin={handleLogin} onNavigateToSignup={() => setShowSignup(true)} settings={settings} />;
  }

  // Authenticated user rendering
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
                    users={users} // Teachers might need to see all users
                    allStudentPerformances={allStudentPerformances} // Teachers need this
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
                    ? <div className="text-center p-10 text-lg font-medium text-blue-600">Generating your personalized quiz...</div>
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