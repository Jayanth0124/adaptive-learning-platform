// src/services/aiQuestionService.ts
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
      Each question must be in the "${category}" category.

      Provide the output in a valid JSON object format. The JSON object should have a single key named "questions", which contains an array of question objects. Each object in the array should have the following structure:
      {
        "text": "The question text.",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0, // The index of the correct answer in the options array
        "difficulty": "${difficulty}",
        "category": "${category}",
        "tags": ["tag1", "tag2"],
        "explanation": "A brief explanation of the correct answer."
      }

      Do not include any text or formatting outside of the main JSON object.
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
            { role: 'system', content: 'You are an expert quiz question creator. Your responses must be a single, valid JSON object with a "questions" key containing an array of questions.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: "json_object" },
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error Response:", errorBody);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // --- Robust Parsing Logic ---
      const jsonResponse = JSON.parse(content);

      if (typeof jsonResponse !== 'object' || jsonResponse === null) {
        throw new Error("AI response is not a valid object.");
      }

      // Find the key that holds the array of questions (e.g., "questions", "results")
      const questionsArray = Object.values(jsonResponse).find(value => Array.isArray(value));

      if (!questionsArray) {
          throw new Error("AI response does not contain a valid array of questions.");
      }

      // Validate that each item in the array is an object
      if (!questionsArray.every(q => typeof q === 'object' && q !== null)) {
          throw new Error("Not all items in the AI response array are valid question objects.");
      }

      return questionsArray as Omit<Question, 'id'>[];
    } catch (error) {
      console.error('Error generating or parsing questions with AI:', error);
      throw error;
    }
  }
}