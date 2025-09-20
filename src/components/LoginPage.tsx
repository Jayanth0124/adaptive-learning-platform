import React, { useState } from 'react';
import { AuthState, AdaptiveSettings } from '../types';
import { AuthService } from '../services/authService';
import { BookOpen, User, Lock, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (authState: AuthState) => void;
  onNavigateToSignup: () => void;
  settings: AdaptiveSettings;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignup, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const authState = await AuthService.login(username, password);
    
    if (authState) {
      onLogin(authState);
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{settings?.appName || 'AdaptiveLearn'}</h1>
          <p className="text-gray-600">Sign in to your learning platform</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
              </div>
            </div>
            {error && (
              <div className="flex items-center p-3 bg-red-50 border rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          {settings?.publicSignupEnabled && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <button onClick={onNavigateToSignup} className="font-medium text-blue-600 hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
