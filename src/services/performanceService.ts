import { StudentPerformance, User } from '../types';
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, addDoc, query, orderBy, limit } from 'firebase/firestore';

export interface QuizCompletion {
    id?: string;
    studentId: string;
    studentName: string;
    score: number;
    totalQuestions: number;
    completedAt: Date;
}

export class PerformanceService {
  private static readonly performancesCollectionRef = collection(db, "performances");
  private static readonly completionsCollectionRef = collection(db, "quizCompletions");

  static async getPerformance(studentId: string): Promise<StudentPerformance> {
    const docRef = doc(db, "performances", studentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as StudentPerformance;
    } else {
      return {
        id: studentId, totalQuestions: 0, correctAnswers: 0, averageTime: 0, hasCompletedQuiz: false,
        difficultyDistribution: { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } },
        categoryPerformance: {}, lastUpdated: new Date()
      };
    }
  }

  static async updatePerformance(studentId: string, performanceData: StudentPerformance): Promise<void> {
    const docRef = doc(db, "performances", studentId);
    await setDoc(docRef, performanceData);
  }
  
  /**
   * Logs a new quiz completion event to Firestore.
   */
  static async logQuizCompletion(studentId: string, studentName: string, performance: StudentPerformance): Promise<void> {
    const score = performance.totalQuestions > 0 ? (performance.correctAnswers / performance.totalQuestions) * 100 : 0;
    const completionData: QuizCompletion = {
        studentId,
        studentName,
        score,
        totalQuestions: performance.totalQuestions,
        completedAt: new Date()
    };
    await addDoc(this.completionsCollectionRef, completionData);
  }

  /**
   * Fetches the 5 most recently completed quizzes.
   */
  static async getRecentCompletions(): Promise<QuizCompletion[]> {
      const q = query(this.completionsCollectionRef, orderBy('completedAt', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as QuizCompletion[];
  }

  static async getAllStudentPerformances(users: User[]): Promise<(StudentPerformance & { studentName: string })[]> {
    const allPerformances: (StudentPerformance & { studentName: string })[] = [];
    const students = users.filter(u => u.role === 'student');
    const studentNameMap = new Map(students.map(s => [s.id, s.name]));
    const snapshot = await getDocs(this.performancesCollectionRef);
    const performancesMap = new Map(snapshot.docs.map(doc => [doc.id, doc.data() as StudentPerformance]));

    for (const student of students) {
        const performanceData = performancesMap.get(student.id);
        if (performanceData) {
            allPerformances.push({ ...performanceData, studentName: student.name });
        } else {
            allPerformances.push({
                id: student.id, studentName: student.name, totalQuestions: 0, correctAnswers: 0, averageTime: 0, hasCompletedQuiz: false,
                difficultyDistribution: { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } },
                categoryPerformance: {}, lastUpdated: new Date()
            });
        }
    }
    return allPerformances;
  }
}