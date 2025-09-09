import React, { useState, useEffect } from 'react';
import { Question, QuizAttempt, StudentPerformance } from '../types';
import { Clock, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizInterfaceProps {
  questions: Question[];
  onQuizComplete: (attempts: QuizAttempt[]) => void;
  performance: StudentPerformance;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ questions, onQuizComplete, performance }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    setStartTime(Date.now());
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, startTime]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const questionStartTime = startTime;
    const questionEndTime = Date.now();
    const questionTimeSpent = Math.floor((questionEndTime - questionStartTime) / 1000);

    const attempt: QuizAttempt = {
      id: `${currentQuestion.id}-${Date.now()}`,
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent: questionTimeSpent,
      timestamp: new Date()
    };

    const newAttempts = [...attempts, attempt];
    setAttempts(newAttempts);

    if (isLastQuestion) {
      setShowResults(true);
      onQuizComplete(newAttempts);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setStartTime(Date.now());
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAttempts([]);
    setStartTime(Date.now());
    setShowResults(false);
    setTimeSpent(0);
  };

  if (showResults) {
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
    const averageTime = totalTime / attempts.length;
    const accuracy = (correctAnswers / attempts.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              accuracy >= 80 ? 'bg-green-100' : accuracy >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {accuracy >= 80 ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : accuracy >= 60 ? (
                <Clock className="h-10 w-10 text-yellow-600" />
              ) : (
                <XCircle className="h-10 w-10 text-red-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">Here's how you performed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{correctAnswers}/{questions.length}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{accuracy.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{totalTime}s</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{averageTime.toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Avg per Question</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {attempts.map((attempt, index) => {
              const question = questions[index];
              return (
                <div key={attempt.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{question.text}</h4>
                      <div className="text-sm text-gray-600">
                        Your answer: {question.options[attempt.selectedAnswer]}
                        {!attempt.isCorrect && (
                          <span className="ml-2 text-green-600">
                            (Correct: {question.options[question.correctAnswer]})
                          </span>
                        )}
                      </div>
                      {question.explanation && (
                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {question.explanation}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center ml-4">
                      {attempt.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="ml-2 text-sm text-gray-500">{attempt.timeSpent}s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestartQuiz}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Take Another Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              {timeSpent}s
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="px-6 pb-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className={`px-2 py-1 text-xs rounded-full ${
                currentQuestion.difficulty === 'easy' 
                  ? 'bg-green-100 text-green-800'
                  : currentQuestion.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentQuestion.difficulty}
              </span>
              <span className="ml-2 text-xs text-gray-500">{currentQuestion.category}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;