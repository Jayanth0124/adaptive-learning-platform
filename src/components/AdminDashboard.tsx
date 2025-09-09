import React, { useState, useEffect } from 'react';
import { User, AdaptiveSettings } from '../types';
import { LayoutDashboard, Users, Settings, Bell, Menu, X } from 'lucide-react';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            <aside className={`fixed lg:relative inset-y-0 left-0 bg-white border-r w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-50`}>
                <div className="p-4 flex justify-between items-center lg:justify-start border-b h-16">
                    <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
                    <button className="lg:hidden p-1 text-gray-500 hover:text-gray-800" onClick={() => setIsSidebarOpen(false)}>
                        <X className="h-6 w-6"/>
                    </button>
                </div>
                <nav className="mt-4">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => { setActiveView(item.id); setIsSidebarOpen(false); }}
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
            <div className="flex-1 flex flex-col h-full">
                 <header className="lg:hidden bg-white border-b p-4 flex items-center sticky top-0 z-20">
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-6 w-6 text-gray-600"/>
                    </button>
                    <h2 className="ml-4 font-semibold text-gray-800">
                        {navItems.find(item => item.id === activeView)?.label}
                    </h2>
                 </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {activeView === 'overview' && <AdminDashboardOverview stats={stats} recentUsers={recentUsers} recentCompletions={recentCompletions} />}
                    {activeView === 'users' && <AdminUserManagement {...props} />}
                    {activeView === 'notifications' && <NotificationManager currentUser={props.currentUser} />}
                    {activeView === 'settings' && <AdminSettings settings={props.settings} onUpdateSettings={props.onUpdateSettings} />}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;