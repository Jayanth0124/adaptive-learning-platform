import { doc, getDoc, setDoc, collection, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { AdaptiveSettings } from '../types';

const settingsDocRef = doc(db, 'settings', 'quizConfig');

const defaultSettings: AdaptiveSettings = {
  poolSize: 10,
  minQuestionsBeforeAdaptation: 5,
  publicSignupEnabled: true,
  appName: 'AdaptiveLearn',
  difficultyBalanceRatio: { easy: 0.4, medium: 0.4, hard: 0.2 },
  adaptationResponseTime: 30,
  studentFitScore: 50,
};

export class SettingsService {
  static async getSettings(): Promise<AdaptiveSettings> {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return { ...defaultSettings, ...docSnap.data() };
    } else {
      await setDoc(settingsDocRef, defaultSettings);
      return defaultSettings;
    }
  }

  static async updateSettings(newSettings: Partial<AdaptiveSettings>): Promise<void> {
    await setDoc(settingsDocRef, newSettings, { merge: true });
  }

  static async resetAllStudentProgress(): Promise<void> {
    const batch = writeBatch(db);
    const performancesRef = collection(db, "performances");
    const completionsRef = collection(db, "quizCompletions");
    
    const performancesSnap = await getDocs(performancesRef);
    performancesSnap.forEach(doc => batch.delete(doc.ref));

    const completionsSnap = await getDocs(completionsRef);
    completionsSnap.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
  }

  static async clearQuestionPool(): Promise<void> {
    const batch = writeBatch(db);
    const questionsRef = collection(db, "questions");
    const snapshot = await getDocs(questionsRef);
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}