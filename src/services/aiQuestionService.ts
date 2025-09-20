import { Question } from '../types';

// Read the OpenRouter API key from environment variables
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class AIQuestionService {
  static async generateQuestions(
    topic: string,
    numQuestions: number,
    difficulty: 'easy' | 'medium' | 'hard',
    category: string
  ): Promise<Omit<Question, 'id'>[]> {
    if (!API_KEY) {
      throw new Error('OpenRouter API key is not configured in the .env file.');
    }

    const prompt = `
      Generate ${numQuestions} multiple-choice questions about "${topic}".
      The difficulty level for all questions should be "${difficulty}".
      Each question should be in the "${category}" category.

      Provide the output in a valid JSON array format. Each object in the array should have the following structure:
      {
        "text": "The question text.",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0, // The index of the correct answer in the options array
        "difficulty": "${difficulty}",
        "category": "${category}",
        "tags": ["tag1", "tag2"],
        "explanation": "A brief explanation of the correct answer."
      }

      Do not include any text or formatting outside of the JSON array.
    `;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: [
            { role: 'system', content: 'You are an expert quiz question creator. Your responses must be in valid, clean JSON format.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: "json_object" },
          max_tokens: 2048, // **FIX: Added a token limit to stay within the free tier**
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response:", errorBody);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      const jsonResponse = JSON.parse(content);
      
      const questionsArray = Array.isArray(jsonResponse) 
        ? jsonResponse 
        : Object.values(jsonResponse)[0];

      return questionsArray as Omit<Question, 'id'>[];
    } catch (error) {
      console.error('Error generating questions with AI:', error);
      throw error;
    }
  }
}