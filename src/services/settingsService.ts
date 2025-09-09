import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AdaptiveSettings } from '../types';

const settingsDocRef = doc(db, 'settings', 'quizConfig');

const defaultSettings: AdaptiveSettings = {
  poolSize: 10,
  minQuestionsBeforeAdaptation: 5,
  // These are no longer used but kept for type compatibility
  difficultyBalanceRatio: { easy: 0.4, medium: 0.4, hard: 0.2 },
  adaptationResponseTime: 30,
  studentFitScore: 50,
};

export class SettingsService {
  /**
   * Fetches the current quiz settings from Firestore.
   * If no settings document exists, it creates one with default values.
   */
  static async getSettings(): Promise<AdaptiveSettings> {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as AdaptiveSettings;
    } else {
      // If the document doesn't exist, create it with default settings
      await setDoc(settingsDocRef, defaultSettings);
      return defaultSettings;
    }
  }

  /**
   * Updates the quiz settings in Firestore.
   */
  static async updateSettings(newSettings: Partial<AdaptiveSettings>): Promise<void> {
    // Use setDoc with merge: true to update only the specified fields
    await setDoc(settingsDocRef, newSettings, { merge: true });
  }
}