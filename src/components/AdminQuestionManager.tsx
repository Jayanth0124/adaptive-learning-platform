// src/components/AdminQuestionManager.tsx
import React, { useState, useEffect } from 'react';
import { Question, User } from '../types';
import { db } from '../firebase'; // Import the db instance
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Edit, Trash2, Search, Filter, Tag, Save, X, AlertCircle, CheckCircle, Users } from 'lucide-react';


interface AdminQuestionManagerProps {
    onQuestionUpdate: (questions: Question[]) => void;
    users: User[];
}

const AdminQuestionManager: React.FC<AdminQuestionManagerProps> = ({ onQuestionUpdate, users }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const questionsCollectionRef = collection(db, "questions");

    useEffect(() => {
        const getQuestions = async () => {
            const data = await getDocs(questionsCollectionRef);
            const loadedQuestions = data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Question[];
            setQuestions(loadedQuestions);
            onQuestionUpdate(loadedQuestions);
        };

        getQuestions();
    }, []);


    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredQuestions = questions.filter(question => {
        const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
        const matchesCategory = filterCategory === 'all' || question.category === filterCategory;

        return matchesSearch && matchesDifficulty && matchesCategory;
    });

    const categories = [...new Set(questions.map(q => q.category))];
    const difficulties = ['easy', 'medium', 'hard'];
    const studentCount = users.filter(u => u.role === 'student').length;

    const handleAddQuestion = async (newQuestion: Omit<Question, 'id'>) => {
        await addDoc(questionsCollectionRef, newQuestion);
        // Refresh questions from Firestore
        const data = await getDocs(questionsCollectionRef);
        const loadedQuestions = data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Question[];
        setQuestions(loadedQuestions);
        onQuestionUpdate(loadedQuestions);
        setShowAddForm(false);
        showNotification('success', 'Question added successfully!');
    };


    const handleEditQuestion = async (updatedQuestion: Question) => {
        const questionDoc = doc(db, "questions", updatedQuestion.id);
        const { id, ...questionData } = updatedQuestion;
        await updateDoc(questionDoc, questionData);

        const updatedQuestions = questions.map(q =>
            q.id === updatedQuestion.id ? updatedQuestion : q
        );
        setQuestions(updatedQuestions);
        onQuestionUpdate(updatedQuestions);
        setEditingQuestion(null);
        showNotification('success', 'Question updated successfully!');
    };

    const handleDeleteQuestion = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            const questionDoc = doc(db, "questions", id);
            await deleteDoc(questionDoc);

            const updatedQuestions = questions.filter(q => q.id !== id);
            setQuestions(updatedQuestions);
            onQuestionUpdate(updatedQuestions);
            showNotification('success', 'Question deleted successfully!');
        }
    };
    const handleBulkImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const importedQuestions = JSON.parse(e.target?.result as string);
                    if (Array.isArray(importedQuestions)) {
                        for (const q of importedQuestions) {
                            await addDoc(questionsCollectionRef, q);
                        }
                        const data = await getDocs(questionsCollectionRef);
                        const loadedQuestions = data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Question[];
                        setQuestions(loadedQuestions);
                        onQuestionUpdate(loadedQuestions);
                        showNotification('success', `Imported ${importedQuestions.length} questions successfully!`);
                    }
                } catch (error) {
                    showNotification('error', 'Error importing questions. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleExportQuestions = () => {
        const dataStr = JSON.stringify(questions, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'questions.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        showNotification('success', 'Questions exported successfully!');
    };


    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                    {notification.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={`text-sm ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                        {notification.message}
                    </span>
                </div>
            )}

            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin - Question Management</h1>
                        <p className="text-gray-600">Create, edit, and manage questions for adaptive learning</p>
                    </div>
                    <div className="flex space-x-3">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleBulkImport}
                            className="hidden"
                            id="import-questions"
                        />
                        <label
                            htmlFor="import-questions"
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer flex items-center"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Import
                        </label>
                        <button
                            onClick={handleExportQuestions}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Export
                        </button>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="relative flex-1 min-w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Difficulties</option>
                        {difficulties.map(diff => (
                            <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                        ))}
                    </select>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
                        <div className="text-sm text-gray-600">Total Questions</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            {questions.filter(q => q.difficulty === 'easy').length}
                        </div>
                        <div className="text-sm text-gray-600">Easy</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-2xl font-bold text-yellow-600">
                            {questions.filter(q => q.difficulty === 'medium').length}
                        </div>
                        <div className="text-sm text-gray-600">Medium</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-2xl font-bold text-red-600">
                            {questions.filter(q => q.difficulty === 'hard').length}
                        </div>
                        <div className="text-sm text-gray-600">Hard</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                        <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-2xl font-bold text-indigo-600">{studentCount}</div>
                        <div className="text-sm text-gray-600">Students</div>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {filteredQuestions.map(question => (
                    <div key={question.id} className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <span className={`px-2 py-1 text-xs rounded-full mr-2 ${question.difficulty === 'easy'
                                            ? 'bg-green-100 text-green-800'
                                            : question.difficulty === 'medium'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                        {question.difficulty}
                                    </span>
                                    <span className="text-sm text-gray-600 font-medium">{question.category}</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{question.text}</h3>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {question.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditingQuestion(question)}
                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                            {question.options.map((option, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg text-sm border ${index === question.correctAnswer
                                            ? 'bg-green-50 text-green-800 border-green-200 font-medium'
                                            : 'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}
                                >
                                    <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                                    {option}
                                    {index === question.correctAnswer && (
                                        <span className="ml-2 text-green-600">✓</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-sm text-blue-800">
                                    <strong className="text-blue-900">Explanation:</strong> {question.explanation}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filteredQuestions.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Search className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria or add new questions.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Question Modal */}
            {(showAddForm || editingQuestion) && (
                <QuestionForm
                    question={editingQuestion}
                    onSave={editingQuestion ? handleEditQuestion : handleAddQuestion}
                    onCancel={() => {
                        setShowAddForm(false);
                        setEditingQuestion(null);
                    }}
                />
            )}
        </div>
    );
};

const QuestionForm: React.FC<{
  question?: Question | null;
  onSave: (question: Question | Omit<Question, 'id'>) => Promise<void>; 
  onCancel: () => void;
}> = ({ question, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        text: question?.text || '',
        options: question?.options || ['', '', '', ''],
        correctAnswer: question?.correctAnswer || 0,
        difficulty: question?.difficulty || 'medium' as const,
        category: question?.category || '',
        tags: question?.tags.join(', ') || '',
        explanation: question?.explanation || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.text.trim()) {
            newErrors.text = 'Question text is required';
        }

        if (!formData.category.trim()) {
            newErrors.category = 'Category is required';
        }

        formData.options.forEach((option, index) => {
            if (!option.trim()) {
                newErrors[`option${index}`] = `Option ${String.fromCharCode(65 + index)} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const questionData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        };

        if (question) {
            onSave({ ...question, ...questionData });
        } else {
            onSave(questionData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            {question ? 'Edit Question' : 'Add New Question'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question Text *
                            </label>
                            <textarea
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.text ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                rows={3}
                                placeholder="Enter your question here..."
                            />
                            {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Answer Options *
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Click the radio button to mark the correct answer</p>
                            {formData.options.map((option, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        type="radio"
                                        name="correctAnswer"
                                        checked={formData.correctAnswer === index}
                                        onChange={() => setFormData({ ...formData, correctAnswer: index })}
                                        className="mr-3 text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...formData.options];
                                                newOptions[index] = e.target.value;
                                                setFormData({ ...formData, options: newOptions });
                                            }}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`option${index}`] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                        />
                                        {errors[`option${index}`] && (
                                            <p className="text-red-500 text-xs mt-1">{errors[`option${index}`]}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Difficulty *
                                </label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="e.g., Mathematics, Science, History"
                                />
                                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., algebra, basic, calculation"
                            />
                            <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Explanation (optional)
                            </label>
                            <textarea
                                value={formData.explanation}
                                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Explain why this is the correct answer..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {question ? 'Update' : 'Add'} Question
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminQuestionManager;