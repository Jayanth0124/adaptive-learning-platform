import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

// A reusable form for adding/editing questions
const QuestionForm: React.FC<{
  question?: Question | null;
  onSave: (question: Question | Omit<Question, 'id'>) => Promise<void>; 
  onCancel: () => void;
}> = ({ question, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        text: question?.text || '',
        options: question?.options || ['', '', '', ''],
        correctAnswer: question?.correctAnswer ?? 0,
        difficulty: question?.difficulty || 'medium',
        category: question?.category || '',
        tags: question?.tags?.join(', ') || '',
        explanation: question?.explanation || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const questionData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        };
        if (question) onSave({ ...question, ...questionData });
        else onSave(questionData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{question ? 'Edit Question' : 'Add New Question'}</h2>
                <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Question Text</label>
                    <textarea value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})} className="mt-1 w-full p-2 border rounded-md" required rows={3}/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center my-1">
                            <input type="radio" name="correctAnswer" checked={formData.correctAnswer === index} onChange={() => setFormData({...formData, correctAnswer: index})} className="mr-2"/>
                            <input type="text" value={option} onChange={e => {
                                const newOptions = [...formData.options];
                                newOptions[index] = e.target.value;
                                setFormData({...formData, options: newOptions});
                            }} className="w-full p-2 border rounded-md" required placeholder={`Option ${index + 1}`}/>
                        </div>
                    ))}
                 </div>
                 <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                        <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})} className="mt-1 w-full p-2 border rounded-md">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="mt-1 w-full p-2 border rounded-md" required/>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                    <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="mt-1 w-full p-2 border rounded-md"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Explanation</label>
                    <textarea value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} className="mt-1 w-full p-2 border rounded-md" rows={2}/>
                 </div>
                 <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center">
                        <Save className="h-4 w-4 mr-2"/>{question ? 'Update' : 'Add'} Question
                    </button>
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
        if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            const questionDoc = doc(db, "questions", id);
            await deleteDoc(questionDoc);
            fetchQuestions();
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Question Management</h1>
                    <p className="text-gray-600 mt-1">Create, edit, and manage questions for the quiz.</p>
                </div>
                <button onClick={() => setShowAddForm(true)} className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
                    <Plus className="h-5 w-5 mr-2" />Add Question
                </button>
            </div>
            
            <div className="space-y-4">
                {questions.map(q => (
                    <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row justify-between sm:items-center">
                        <div className="mb-2 sm:mb-0">
                           <span className="font-medium text-gray-800">{q.text}</span>
                           <div className="flex items-center mt-1 text-xs">
                               <span className="text-gray-500 mr-2">{q.category}</span>
                               <span className={`px-2 py-0.5 rounded-full text-white ${q.difficulty === 'easy' ? 'bg-green-500' : q.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>{q.difficulty}</span>
                           </div>
                        </div>
                        <div className="flex space-x-2 self-end sm:self-center">
                            <button onClick={() => setEditingQuestion(q)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-gray-500 hover:bg-red-100 rounded-full"><Trash2 className="h-4 w-4 text-red-600" /></button>
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