// src/services/settingsService.ts

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AdaptiveSettings } from '../types';

export const SettingsService = {
  async getSettings(): Promise<AdaptiveSettings> {
    const docRef = doc(db, 'settings', 'quizConfig');
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as AdaptiveSettings;
      } else {
        console.warn("quizConfig document not found. Creating a default one.");
        const defaultSettings: AdaptiveSettings = {
          minQuestionsBeforeAdaptation: 5,
          initialQuizSize: 5,
          adaptiveQuizSize: 5,
          publicSignupEnabled: true,
          aiModelName: "llama3-8b-8192" // Default to your chosen AI model
        };
        await setDoc(docRef, defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      console.error("Error fetching or creating settings:", error);
      // Fallback: If there's an error, return hardcoded default settings
      return {
          minQuestionsBeforeAdaptation: 5,
          initialQuizSize: 5,
          adaptiveQuizSize: 5,
          publicSignupEnabled: true,
          aiModelName: "llama3-8b-8192"
      };
    }
  },

  async updateSettings(newSettings: Partial<AdaptiveSettings>): Promise<void> {
    const docRef = doc(db, 'settings', 'quizConfig');
    await setDoc(docRef, newSettings, { merge: true });
  }
};