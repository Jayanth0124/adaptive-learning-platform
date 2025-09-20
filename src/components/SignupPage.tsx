import React, { useState } from 'react';
import { Lock, BookOpen } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{settings.appName}</h1>
          <p className="text-gray-600">Create your student account</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border p-8">
          {settings.publicSignupEnabled ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg">
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">Signups Are Currently Disabled</h2>
              <p className="text-gray-600 mt-2">Please contact an administrator to create an account.</p>
            </div>
          )}
          <div className="text-center mt-4">
            <button onClick={onBackToLogin} className="text-sm text-blue-600 hover:underline">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;