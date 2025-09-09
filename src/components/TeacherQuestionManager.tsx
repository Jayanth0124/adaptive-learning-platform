import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Edit, Trash2, Search, Filter, Tag, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

// This is the QuestionForm sub-component, you can place it in the same file or a separate one.
const QuestionForm: React.FC<{
  question?: Question | null;
  onSave: (question: Question | Omit<Question, 'id'>) => Promise<void>; 
  onCancel: () => void;
}> = ({ question, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        text: question?.text || '', options: question?.options || ['', '', '', ''],
        correctAnswer: question?.correctAnswer ?? 0, difficulty: question?.difficulty || 'medium',
        category: question?.category || '', tags: question?.tags?.join(', ') || '', explanation: question?.explanation || ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => { /* ... validation logic from AdminQuestionManager ... */ return true; };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const questionData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        };

        if (question) {
            onSave({ ...question, ...questionData });
        } else {
            onSave(questionData);
        }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {/* The full JSX for the form modal from AdminQuestionManager.tsx goes here */}
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{question ? 'Edit Question' : 'Add Question'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 {/* All form inputs (textarea for text, inputs for options, selects, etc.) go here */}
                 <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">{question ? 'Update' : 'Add'}</button>
                 </div>
            </form>
          </div>
      </div>
    );
};


const TeacherQuestionManager: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const questionsCollectionRef = collection(db, "questions");

    const fetchQuestions = async () => {
        const data = await getDocs(questionsCollectionRef);
        setQuestions(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Question[]);
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleAddQuestion = async (newQuestion: Omit<Question, 'id'>) => {
        await addDoc(questionsCollectionRef, newQuestion);
        fetchQuestions();
        setShowAddForm(false);
    };

    const handleEditQuestion = async (updatedQuestion: Question) => {
        const questionDoc = doc(db, "questions", updatedQuestion.id);
        const { id, ...questionData } = updatedQuestion;
        await updateDoc(questionDoc, questionData);
        fetchQuestions();
        setEditingQuestion(null);
    };

    const handleDeleteQuestion = async (id: string) => {
        if (window.confirm('Are you sure?')) {
            const questionDoc = doc(db, "questions", id);
            await deleteDoc(questionDoc);
            fetchQuestions();
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
                <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                    <Plus className="h-4 w-4 mr-2" />Add Question
                </button>
            </div>
            
            <div className="space-y-4">
                {questions.map(q => (
                    <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                        <span className="font-medium">{q.text}</span>
                        <div className="space-x-2">
                            <button onClick={() => setEditingQuestion(q)} className="p-2 hover:bg-gray-100 rounded-full"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 hover:bg-red-100 rounded-full"><Trash2 className="h-4 w-4 text-red-600" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {(showAddForm || editingQuestion) && (
                <QuestionForm
                    question={editingQuestion}
                    onSave={editingQuestion ? handleEditQuestion : handleAddQuestion}
                    onCancel={() => { setShowAddForm(false); setEditingQuestion(null); }}
                />
            )}
        </div>
    );
};

export default TeacherQuestionManager;