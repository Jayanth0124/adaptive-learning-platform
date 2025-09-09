import { Question } from '../types';

export const questionPool: Question[] = [
  // Mathematics - Easy
  {
    id: 'math-1',
    text: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
    difficulty: 'easy',
    tags: ['addition', 'basic'],
    category: 'Mathematics',
    explanation: '2 + 2 equals 4. This is basic addition.'
  },
  {
    id: 'math-2',
    text: 'What is 10 - 3?',
    options: ['6', '7', '8', '9'],
    correctAnswer: 1,
    difficulty: 'easy',
    tags: ['subtraction', 'basic'],
    category: 'Mathematics',
    explanation: '10 - 3 equals 7. This is basic subtraction.'
  },
  {
    id: 'math-3',
    text: 'What is 3 × 4?',
    options: ['10', '11', '12', '13'],
    correctAnswer: 2,
    difficulty: 'easy',
    tags: ['multiplication', 'basic'],
    category: 'Mathematics',
    explanation: '3 × 4 equals 12. This is basic multiplication.'
  },
  
  // Mathematics - Medium
  {
    id: 'math-4',
    text: 'What is 15% of 200?',
    options: ['25', '30', '35', '40'],
    correctAnswer: 1,
    difficulty: 'medium',
    tags: ['percentage', 'calculation'],
    category: 'Mathematics',
    explanation: '15% of 200 = 0.15 × 200 = 30'
  },
  {
    id: 'math-5',
    text: 'Solve for x: 2x + 5 = 13',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
    difficulty: 'medium',
    tags: ['algebra', 'equation'],
    category: 'Mathematics',
    explanation: '2x + 5 = 13, so 2x = 8, therefore x = 4'
  },
  {
    id: 'math-6',
    text: 'What is the area of a rectangle with length 8 and width 5?',
    options: ['35', '40', '45', '50'],
    correctAnswer: 1,
    difficulty: 'medium',
    tags: ['geometry', 'area'],
    category: 'Mathematics',
    explanation: 'Area = length × width = 8 × 5 = 40'
  },

  // Mathematics - Hard
  {
    id: 'math-7',
    text: 'What is the derivative of x²?',
    options: ['x', '2x', '2x²', 'x²/2'],
    correctAnswer: 1,
    difficulty: 'hard',
    tags: ['calculus', 'derivative'],
    category: 'Mathematics',
    explanation: 'The derivative of x² is 2x using the power rule'
  },
  {
    id: 'math-8',
    text: 'Solve the quadratic equation: x² - 5x + 6 = 0',
    options: ['x = 1, 6', 'x = 2, 3', 'x = 3, 4', 'x = 4, 5'],
    correctAnswer: 1,
    difficulty: 'hard',
    tags: ['algebra', 'quadratic'],
    category: 'Mathematics',
    explanation: 'Factoring: (x-2)(x-3) = 0, so x = 2 or x = 3'
  },

  // Science - Easy
  {
    id: 'science-1',
    text: 'What is the chemical symbol for water?',
    options: ['H2O', 'CO2', 'NaCl', 'O2'],
    correctAnswer: 0,
    difficulty: 'easy',
    tags: ['chemistry', 'basic'],
    category: 'Science',
    explanation: 'Water is composed of 2 hydrogen atoms and 1 oxygen atom: H2O'
  },
  {
    id: 'science-2',
    text: 'How many planets are in our solar system?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 1,
    difficulty: 'easy',
    tags: ['astronomy', 'solar-system'],
    category: 'Science',
    explanation: 'Our solar system has 8 planets after Pluto was reclassified as a dwarf planet'
  },

  // Science - Medium
  {
    id: 'science-3',
    text: 'What is the speed of light in vacuum?',
    options: ['299,792,458 m/s', '300,000,000 m/s', '186,000 mph', 'All of the above'],
    correctAnswer: 0,
    difficulty: 'medium',
    tags: ['physics', 'light'],
    category: 'Science',
    explanation: 'The exact speed of light in vacuum is 299,792,458 meters per second'
  },
  {
    id: 'science-4',
    text: 'What is the most abundant gas in Earth\'s atmosphere?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
    correctAnswer: 2,
    difficulty: 'medium',
    tags: ['chemistry', 'atmosphere'],
    category: 'Science',
    explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere'
  },

  // Science - Hard
  {
    id: 'science-5',
    text: 'What is the Heisenberg Uncertainty Principle?',
    options: [
      'Energy cannot be created or destroyed',
      'The more precisely position is known, the less precisely momentum can be known',
      'Matter and energy are equivalent',
      'Every action has an equal and opposite reaction'
    ],
    correctAnswer: 1,
    difficulty: 'hard',
    tags: ['physics', 'quantum'],
    category: 'Science',
    explanation: 'The Heisenberg Uncertainty Principle states that position and momentum cannot both be precisely measured simultaneously'
  },

  // History - Easy
  {
    id: 'history-1',
    text: 'In which year did World War II end?',
    options: ['1944', '1945', '1946', '1947'],
    correctAnswer: 1,
    difficulty: 'easy',
    tags: ['world-war', '20th-century'],
    category: 'History',
    explanation: 'World War II ended in 1945 with the surrender of Japan in September'
  },
  {
    id: 'history-2',
    text: 'Who was the first President of the United States?',
    options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'],
    correctAnswer: 1,
    difficulty: 'easy',
    tags: ['american-history', 'presidents'],
    category: 'History',
    explanation: 'George Washington was the first President of the United States (1789-1797)'
  },

  // History - Medium
  {
    id: 'history-3',
    text: 'The Renaissance began in which country?',
    options: ['France', 'Germany', 'Italy', 'Spain'],
    correctAnswer: 2,
    difficulty: 'medium',
    tags: ['renaissance', 'culture'],
    category: 'History',
    explanation: 'The Renaissance began in Italy during the 14th century'
  },

  // History - Hard
  {
    id: 'history-4',
    text: 'What treaty ended the Thirty Years\' War?',
    options: ['Treaty of Versailles', 'Treaty of Westphalia', 'Treaty of Utrecht', 'Treaty of Paris'],
    correctAnswer: 1,
    difficulty: 'hard',
    tags: ['treaties', 'european-history'],
    category: 'History',
    explanation: 'The Peace of Westphalia (1648) ended the Thirty Years\' War'
  }
];