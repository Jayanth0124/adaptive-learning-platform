import React, { useState } from 'react';
import { AuthState, AdaptiveSettings } from '../types';
import { AuthService } from '../services/authService';
import { BookOpen, User, Lock, AlertCircle, Eye, EyeOff, Brain, Lightbulb, Trophy } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-form-section">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{settings?.appName || 'AdaptiveLearn'}</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-gray-600">Please sign in to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 border rounded-lg" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center p-3 bg-red-50 border rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {settings?.publicSignupEnabled && (
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <button onClick={onNavigateToSignup} className="font-medium text-blue-600 hover:underline">
                Sign up
              </button>
            </p>
          )}
        </div>

        <div className="auth-visual-section">
            <div className="absolute inset-0 z-0">
                <Brain className="floating-icon" style={{ width: '80px', height: '80px', top: '15%', left: '20%', animationDuration: '8s' }} />
                <Lightbulb className="floating-icon" style={{ width: '60px', height: '60px', top: '30%', right: '15%', animationDuration: '10s', animationDelay: '2s' }} />
                <Trophy className="floating-icon" style={{ width: '90px', height: '90px', top: '65%', left: '10%', animationDuration: '12s' }} />
                <BookOpen className="floating-icon" style={{ width: '70px', height: '70px', top: '70%', right: '25%', animationDuration: '9s', animationDelay: '3s' }} />
            </div>
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Unlock Your Potential.</h2>
                <p className="text-indigo-200 leading-relaxed max-w-sm mx-auto">
                    Our adaptive learning platform tailors the experience to your unique needs, helping you master concepts faster and more effectively.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;