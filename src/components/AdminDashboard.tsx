import React, { useState, useEffect } from 'react';
import { User, AdaptiveSettings } from '../types';
import { LayoutDashboard, Users, Settings, Bell } from 'lucide-react';
import AdminUserManagement from './AdminUserManagement';
import AdminSettings from './AdminSettings';
import AdminDashboardOverview from './AdminDashboardOverview';
import NotificationManager from './NotificationManager';
import { AuthService } from '../services/authService';
import { QuizCompletion, PerformanceService } from '../services/performanceService';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';

interface AdminDashboardProps {
    currentUser: User;
    users: User[];
    onDeleteUser: (userId: string) => Promise<void>;
    onCreateUser: (name: string, username: string, pass: string, role: 'student' | 'teacher') => Promise<boolean>;
    onUpdateUserRole: (userId: string, newRole: 'student' | 'teacher') => Promise<void>;
    settings: AdaptiveSettings;
    onUpdateSettings: (newSettings: Partial<AdaptiveSettings>) => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeView, setActiveView] = useState('overview');
    const [stats, setStats] = useState({ userCount: 0, studentCount: 0, questionCount: 0 });
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [recentCompletions, setRecentCompletions] = useState<QuizCompletion[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const userColl = collection(db, "users");
            const questionColl = collection(db, "questions");
            const userSnapshot = await getCountFromServer(userColl);
            const questionSnapshot = await getCountFromServer(questionColl);
            
            setStats({
                userCount: userSnapshot.data().count,
                studentCount: props.users.filter(u => u.role === 'student').length,
                questionCount: questionSnapshot.data().count,
            });

            const rUsers = await AuthService.getRecentUsers(5);
            const rCompletions = await PerformanceService.getRecentCompletions();
            setRecentUsers(rUsers);
            setRecentCompletions(rCompletions);
        };

        if (activeView === 'overview') {
            fetchDashboardData();
        }
    }, [props.users, activeView]);

    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'System Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <aside className="w-64 bg-white border-r">
                <nav className="mt-4">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                                activeView === item.id 
                                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-500' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}>
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 p-8">
                {activeView === 'overview' && <AdminDashboardOverview stats={stats} recentUsers={recentUsers} recentCompletions={recentCompletions} />}
                {activeView === 'users' && <AdminUserManagement {...props} />}
                {activeView === 'notifications' && <NotificationManager currentUser={props.currentUser} />}
                {activeView === 'settings' && <AdminSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} />}
            </main>
        </div>
    );
};

export default AdminDashboard;