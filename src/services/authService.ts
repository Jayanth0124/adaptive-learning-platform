import { User, AuthState } from '../types';
import { users as initialUsers } from '../data/users';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, writeBatch, orderBy, limit, updateDoc } from 'firebase/firestore';

export class AuthService {
  private static readonly AUTH_KEY = 'auth-state';
  private static readonly usersCollectionRef = collection(db, "users");

  private static async initializeUsers() {
    const snapshot = await getDocs(this.usersCollectionRef);
    if (snapshot.empty) {
        const batch = writeBatch(db);
        initialUsers.forEach(user => {
            const { id, ...userData } = user;
            const docRef = doc(this.usersCollectionRef); 
            batch.set(docRef, { ...userData, createdAt: new Date() });
        });
        await batch.commit();
    }
  }

  static async getUsers(): Promise<User[]> {
    await this.initializeUsers();
    const data = await getDocs(this.usersCollectionRef);
    return data.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id, createdAt: data.createdAt?.toDate() }
    }) as User[];
  }

  static async getRecentUsers(count: number): Promise<User[]> {
      const q = query(this.usersCollectionRef, orderBy('createdAt', 'desc'), limit(count));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id, createdAt: data.createdAt?.toDate() }
    }) as User[];
  }
  
  static async createUser(name: string, username: string, password: string, role: 'student' | 'teacher'): Promise<User | null> {
    const q = query(this.usersCollectionRef, where("username", "==", username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return null;

    const newUser = { name, username, password, role, createdAt: new Date() };
    const docRef = await addDoc(this.usersCollectionRef, newUser);
    return { ...newUser, id: docRef.id };
  }
  
  static async updateUserRole(userId: string, newRole: 'student' | 'teacher'): Promise<void> {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { role: newRole });
  }

  static async deleteUser(userId: string): Promise<boolean> {
    try {
        const userDoc = doc(db, "users", userId);
        await deleteDoc(userDoc);
        return true;
    } catch (error) {
        console.error("Error deleting user:", error);
        return false;
    }
  }

  static async login(username: string, password: string): Promise<AuthState | null> {
    const q = query(this.usersCollectionRef, where("username", "==", username));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    const user = { ...userDoc.data(), id: userDoc.id } as User;

    if (user.password === password) {
      const authState: AuthState = { isAuthenticated: true, user: { ...user, password: '' } };
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(authState));
      return authState;
    }
    return null;
  }

  static async signup(username: string, name: string, password: string): Promise<AuthState | null> {
    const q = query(this.usersCollectionRef, where("username", "==", username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return null;

    const newUser = { username, name, password, role: 'student' as const, createdAt: new Date() };
    const docRef = await addDoc(this.usersCollectionRef, newUser);
    
    const authState: AuthState = { isAuthenticated: true, user: { ...newUser, id: docRef.id, password: '' } };
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(authState));
    return authState;
  }

  static logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
  }

  static getCurrentAuth(): AuthState {
    try {
      const stored = localStorage.getItem(this.AUTH_KEY);
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading auth state:', error);
    }
    return { isAuthenticated: false, user: null };
  }

  static isAdmin(authState: AuthState): boolean {
    return authState.isAuthenticated && authState.user?.role === 'admin';
  }

  static isStudent(authState: AuthState): boolean {
    return authState.isAuthenticated && authState.user?.role === 'student';
  }

  static isTeacher(authState: AuthState): boolean {
    return authState.isAuthenticated && authState.user?.role === 'teacher';
  }
}