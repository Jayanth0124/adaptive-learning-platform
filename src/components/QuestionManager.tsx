import React, { useState } from 'react';
import { Question } from '../types';
import { Plus, Edit, Trash2, Search, Filter, Tag } from 'lucide-react';

interface QuestionManagerProps {
  onQuestionUpdate: (questions: Question[]) => void;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ onQuestionUpdate }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Load questions from localStorage
  React.useEffect(() => {
    const storedQuestions = localStorage.getItem('question-pool');
    if (storedQuestions) {
      try {
        setQuestions(JSON.parse(storedQuestions));
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    }
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student View - Questions</h1>
            <p className="text-gray-600">Browse available questions (Read-only view)</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {questions.filter(q => q.difficulty === 'easy').length}
            </div>
            <div className="text-sm text-gray-600">Easy</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">
              {questions.filter(q => q.difficulty === 'medium').length}
            </div>
            <div className="text-sm text-gray-600">Medium</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">
              {questions.filter(q => q.difficulty === 'hard').length}
            </div>
            <div className="text-sm text-gray-600">Hard</div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map(question => (
          <div key={question.id} className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full mr-2 ${
                    question.difficulty === 'easy' 
                      ? 'bg-green-100 text-green-800'
                      : question.difficulty === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {question.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">{question.category}</span>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm ${
                    index === question.correctAnswer
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </div>
              ))}
            </div>
            
            {question.explanation && (
              <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionManager;