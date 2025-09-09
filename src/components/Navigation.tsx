import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, BarChart3, Users, LogOut, Bell, CheckCircle } from 'lucide-react';
import { AuthState } from '../types';
import { AuthService } from '../services/authService';
import { Notification } from '../services/notificationService';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  authState: AuthState;
  onLogout: () => void;
  unreadNotifications: Notification[];
  onMarkAsRead: (notificationIds: string[]) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, authState, onLogout, unreadNotifications, onMarkAsRead }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = AuthService.isAdmin(authState);
  const isTeacher = AuthService.isTeacher(authState);
  const unreadCount = unreadNotifications.length;

  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen && unreadCount > 0) {
      const idsToMarkAsRead = unreadNotifications.map(n => n.id);
      onMarkAsRead(idsToMarkAsRead);
    }
  };
  
  // Closes dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const getNavItems = () => {
    if (isTeacher) {
      return [
        { id: 'teacher-dashboard', label: 'Dashboard', icon: BarChart3 },
      ];
    } else { // Student
      return [
        { id: 'home', label: 'Home', icon: BookOpen },
        { id: 'dashboard', label: 'My Progress', icon: BarChart3 },
      ];
    }
  };
  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-2">
              <h1 className="text-xl font-bold text-gray-900">AdaptiveLearn</h1>
              <p className="text-xs text-gray-500">
                {isAdmin ? 'Admin Portal' : isTeacher ? 'Teacher Portal' : 'Student Portal'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isAdmin && (
              <div className="flex space-x-6">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onViewChange(id)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === id
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>
            )}
            
            <div className={`relative flex items-center space-x-4 ${!isAdmin ? 'border-l border-gray-200 pl-4' : ''}`} ref={dropdownRef}>
                <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-gray-100">
                    <Bell className="h-5 w-5 text-gray-600"/>
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"/>
                    )}
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-12 right-0 w-80 bg-white border rounded-lg shadow-lg z-20">
                        <div className="p-3 font-semibold text-sm border-b">Notifications</div>
                        <div className="max-h-80 overflow-y-auto">
                            {unreadNotifications.length > 0 ? (
                                unreadNotifications.map(n => (
                                <div key={n.id} className="p-3 border-b hover:bg-gray-50">
                                    <p className="text-sm text-gray-800">{n.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{n.authorName} - {new Date(n.createdAt).toLocaleDateString()}</p>
                                </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center">
                                    <CheckCircle className="h-8 w-8 text-green-400 mb-2"/>
                                    You're all caught up!
                                </div>
                            )}
                        </div>
                    </div>
                )}

              <div className="text-sm">
                <div className="font-medium text-gray-900">{authState.user?.name}</div>
                <div className="text-gray-500 capitalize">{authState.user?.role}</div>
              </div>
              <button onClick={onLogout} className="flex items-center p-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;