import React, { useState } from 'react';
import { User, Lock, BookOpen, Brain, Lightbulb, Trophy } from 'lucide-react';
import { AdaptiveSettings } from '../types';

interface SignupPageProps {
  onSignup: (username: string, name: string, pass: string) => Promise<void>;
  onBackToLogin: () => void;
  settings: AdaptiveSettings;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onBackToLogin, settings }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSignup(username, name, password);
    setIsLoading(false);
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
            <h2 className="text-2xl font-bold text-gray-800">Create Your Account</h2>
            <p className="text-gray-600">Start your personalized learning journey today.</p>
          </div>

          {settings.publicSignupEnabled ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-3 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full p-3 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full p-3 border rounded-lg" required />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400">
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800">Signups Are Currently Disabled</h2>
              <p className="text-gray-600 mt-2">Please contact an administrator to create an account.</p>
            </div>
          )}
          
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <button onClick={onBackToLogin} className="font-medium text-blue-600 hover:underline">
              Sign in
            </button>
          </p>
        </div>
        
        <div className="auth-visual-section">
            <div className="absolute inset-0 z-0">
                <Brain className="floating-icon" style={{ width: '80px', height: '80px', top: '15%', left: '20%', animationDuration: '8s' }} />
                <Lightbulb className="floating-icon" style={{ width: '60px', height: '60px', top: '30%', right: '15%', animationDuration: '10s', animationDelay: '2s' }} />
                <Trophy className="floating-icon" style={{ width: '90px', height: '90px', top: '65%', left: '10%', animationDuration: '12s' }} />
                <BookOpen className="floating-icon" style={{ width: '70px', height: '70px', top: '70%', right: '25%', animationDuration: '9s', animationDelay: '3s' }} />
            </div>
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">A Smarter Way to Learn.</h2>
                <p className="text-indigo-200 leading-relaxed max-w-sm mx-auto">
                    Join a community of learners and experience an education platform that adapts to you.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;