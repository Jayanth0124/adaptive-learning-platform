import React, { useState } from 'react';
import { AdaptiveSettings } from '../types';
import { Save, AlertTriangle } from 'lucide-react';
import { SettingsService } from '../services/settingsService';

interface ConfirmationWithTextModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationWithTextModal: React.FC<ConfirmationWithTextModalProps> = ({ isOpen, title, message, confirmText, onConfirm, onCancel }) => {
    const [inputText, setInputText] = useState('');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-start">
                         <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4 text-left">
                             <h3 className="text-lg leading-6 font-bold text-gray-900">{title}</h3>
                             <p className="text-sm text-gray-500 mt-2 mb-4">{message}</p>
                        </div>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mt-4">To confirm, type "<span className="font-bold">{confirmText}</span>"</label>
                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-4 py-2 text-sm bg-white border rounded-md">Cancel</button>
                    <button onClick={onConfirm} disabled={inputText !== confirmText} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md disabled:bg-red-300 disabled:cursor-not-allowed">Confirm Action</button>
                </div>
            </div>
        </div>
    );
};


const AdminSettings: React.FC<{ settings: AdaptiveSettings; onUpdateSettings: (newSettings: Partial<AdaptiveSettings>) => Promise<void>; }> = ({ settings, onUpdateSettings }) => {
    const [activeTab, setActiveTab] = useState('quiz');
    const [formState, setFormState] = useState(settings);
    const [isSaved, setIsSaved] = useState(false);
    
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdateSettings(formState);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const handleResetProgress = async () => {
        await SettingsService.resetAllStudentProgress();
        setIsResetModalOpen(false);
        alert('All student progress has been reset.');
    };
    
    const handleClearQuestions = async () => {
        await SettingsService.clearQuestionPool();
        setIsClearModalOpen(false);
        alert('The entire question pool has been cleared.');
    };

    return (
        <>
            <ConfirmationWithTextModal 
                isOpen={isResetModalOpen} 
                title="Reset All Student Progress" 
                message="This will permanently delete all quiz history and performance data for every student. This cannot be undone."
                confirmText="RESET PROGRESS"
                onConfirm={handleResetProgress} 
                onCancel={() => setIsResetModalOpen(false)}
            />
             <ConfirmationWithTextModal 
                isOpen={isClearModalOpen} 
                title="Clear Entire Question Pool" 
                message="This will permanently delete every question from the database. Quizzes will not generate until new questions are added. This cannot be undone."
                confirmText="CLEAR QUESTIONS"
                onConfirm={handleClearQuestions} 
                onCancel={() => setIsClearModalOpen(false)}
            />

            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">System Settings</h1>
                <p className="text-gray-600 mb-6">Configure application-wide parameters.</p>
                
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-6">
                            <button type="button" onClick={() => setActiveTab('quiz')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'quiz' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Quiz</button>
                            <button type="button" onClick={() => setActiveTab('users')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Users</button>
                            <button type="button" onClick={() => setActiveTab('appearance')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'appearance' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Appearance</button>
                        </nav>
                    </div>

                    {activeTab === 'quiz' && (
                         <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quiz Question Count</label>
                                <input type="number" name="poolSize" value={formState.poolSize} onChange={handleNumericInputChange} className="mt-1 w-full p-2 border rounded-md" />
                                <p className="mt-1 text-xs text-gray-500">The number of questions in each generated quiz.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Minimum Questions for Adaptive Engine</label>
                                <input type="number" name="minQuestionsBeforeAdaptation" value={formState.minQuestionsBeforeAdaptation} onChange={handleNumericInputChange} className="mt-1 w-full p-2 border rounded-md" />
                                <p className="mt-1 text-xs text-gray-500">A student must answer this many questions before quizzes become adaptive.</p>
                            </div>
                        </div>
                    )}
                     {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <label htmlFor="publicSignupEnabled" className="text-sm font-medium text-gray-900">Enable Public Signup</label>
                                    <p className="text-xs text-gray-500">Allow new users to create their own accounts.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="publicSignupEnabled" name="publicSignupEnabled" checked={formState.publicSignupEnabled} onChange={handleInputChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                     )}
                     {activeTab === 'appearance' && (
                         <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Application Name</label>
                                <input type="text" name="appName" value={formState.appName} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" />
                                <p className="mt-1 text-xs text-gray-500">This name will be displayed in the header.</p>
                            </div>
                        </div>
                     )}

                    <div className="mt-8 flex items-center pt-6 border-t">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                            <Save className="h-4 w-4 mr-2" />
                            Save Settings
                        </button>
                        {isSaved && <span className="ml-4 text-sm text-green-600">Settings saved successfully!</span>}
                    </div>
                </form>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-red-600 flex items-center mb-4"><AlertTriangle className="mr-2"/>Danger Zone</h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-gray-900">Reset All Student Progress</h3>
                                <p className="text-sm text-gray-600">Deletes all quiz results and performance data.</p>
                            </div>
                            <button onClick={() => setIsResetModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Reset</button>
                        </div>
                         <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-gray-900">Clear Entire Question Pool</h3>
                                <p className="text-sm text-gray-600">Permanently deletes all questions from the system.</p>
                            </div>
                            <button onClick={() => setIsClearModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Clear Pool</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminSettings;
