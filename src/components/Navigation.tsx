import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, BarChart3, LogOut, Bell, CheckCircle, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      return [{ id: 'teacher-dashboard', label: 'Dashboard', icon: BarChart3 }];
    } else { // Student
      return [
        { id: 'home', label: 'Home', icon: BookOpen },
        { id: 'dashboard', label: 'My Progress', icon: BarChart3 },
      ];
    }
  };
  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
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
          
          <div className="flex items-center">
            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:flex items-center space-x-4">
              {!isAdmin && (
                <div className="flex space-x-2">
                  {navItems.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => onViewChange(id)} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentView === id ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                      <Icon className="h-4 w-4 mr-2" />{label}
                    </button>
                  ))}
                </div>
              )}
              <div className={`relative flex items-center space-x-2 ${!isAdmin ? 'border-l border-gray-200 pl-4' : ''}`} ref={dropdownRef}>
                <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-gray-100">
                    <Bell className="h-5 w-5 text-gray-600"/>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"/>
                    )}
                </button>
                {isDropdownOpen && (
                    <div className="absolute top-12 right-0 w-80 bg-white border rounded-lg shadow-lg z-20">
                        {/* Notification Dropdown JSX */}
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

            {/* --- MOBILE VIEW --- */}
            <div className="md:hidden flex items-center">
                {!isAdmin && (
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                    </button>
                )}
                {isAdmin && (
                    <div className="flex items-center space-x-2">
                         <div className="text-sm text-right">
                            <div className="font-medium text-gray-900">{authState.user?.name}</div>
                            <div className="text-gray-500 capitalize">{authState.user?.role}</div>
                        </div>
                        <button onClick={onLogout} className="p-2 text-gray-500">
                           <LogOut className="h-5 w-5"/>
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown for Student/Teacher */}
      {isMobileMenuOpen && !isAdmin && (
        <div className="md:hidden bg-white border-t">
            {navItems.map(({ id, label }) => (
                <a key={id} href="#" onClick={(e) => { e.preventDefault(); onViewChange(id); setIsMobileMenuOpen(false); }} className="block py-3 px-4 text-base font-medium text-gray-600 hover:bg-gray-50">{label}</a>
            ))}
             <div className="py-3 px-4 border-t">
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800">{authState.user?.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{authState.user?.role}</p>
                    </div>
                    <button onClick={onLogout} className="text-red-500">
                        <LogOut className="h-5 w-5"/>
                    </button>
                 </div>
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;