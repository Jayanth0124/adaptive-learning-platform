import React, { useState } from 'react';
import { AdaptiveSettings } from '../types';
import { Save } from 'lucide-react';

interface AdminSettingsProps {
    settings: AdaptiveSettings;
    onUpdateSettings: (newSettings: Partial<AdaptiveSettings>) => Promise<void>;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onUpdateSettings }) => {
    const [formState, setFormState] = useState(settings);
    const [isSaved, setIsSaved] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdateSettings(formState);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">System Settings</h1>
            <p className="text-gray-600 mb-6">Configure application-wide parameters.</p>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border max-w-2xl">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="poolSize" className="block text-sm font-medium text-gray-700">
                            Quiz Question Count
                        </label>
                        <input
                            type="number"
                            id="poolSize"
                            name="poolSize"
                            value={formState.poolSize}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="mt-2 text-xs text-gray-500">The number of questions to include in each generated quiz.</p>
                    </div>
                    <div>
                        <label htmlFor="minQuestionsBeforeAdaptation" className="block text-sm font-medium text-gray-700">
                            Minimum Questions for Adaptive Engine
                        </label>
                        <input
                            type="number"
                            id="minQuestionsBeforeAdaptation"
                            name="minQuestionsBeforeAdaptation"
                            value={formState.minQuestionsBeforeAdaptation}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                         <p className="mt-2 text-xs text-gray-500">A student must answer this many questions before quizzes become adaptive.</p>
                    </div>
                </div>
                <div className="mt-8 flex items-center">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                    </button>
                    {isSaved && <span className="ml-4 text-sm text-green-600">Settings saved successfully!</span>}
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;