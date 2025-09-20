// src/services/authService.ts
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { User, AuthState } from '../types';

export class AuthService {
  private static readonly AUTH_KEY = 'adaptive-learn-auth';
  private static readonly usersCollectionRef = collection(db, "users");

  static getCurrentAuth(): AuthState {
    const storedAuth = localStorage.getItem(this.AUTH_KEY);
    if (storedAuth) {
        try {
            const parsedAuth = JSON.parse(storedAuth);
            if (parsedAuth && parsedAuth.isAuthenticated && parsedAuth.user) {
                return parsedAuth;
            }
        } catch (e) {
            localStorage.removeItem(this.AUTH_KEY);
        }
    }
    return { isAuthenticated: false, user: null };
  }

  // --- Login with Username ---
  static async login(username: string, password: string): Promise<AuthState | null> {
    try {
      // 1. Find user's email by username in Firestore
      const q = query(this.usersCollectionRef, where("username", "==", username));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("No user found with that username.");
        return null;
      }
      if (snapshot.docs.length > 1) {
        console.warn("Multiple users found with the same username. This should not happen.");
        alert("An unexpected error occurred. Please contact support.");
        return null;
      }

      const userProfile = snapshot.docs[0].data() as User;
      const userEmail = userProfile.email;

      if (!userEmail) {
          console.error("User profile in Firestore is missing email for username:", username);
          alert("User profile incomplete. Please contact support.");
          return null;
      }

      // 2. Log in using the retrieved email and provided password via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
      const firebaseUser = userCredential.user;

      // 3. Confirm profile exists and store in local storage
      const authState: AuthState = { isAuthenticated: true, user: { ...userProfile, id: firebaseUser.uid } };
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(authState));
      return authState;

    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          alert("Invalid username or password.");
      } else if (error.code === 'auth/invalid-email') {
          alert("Internal error: User's stored email is invalid.");
      } else {
          alert(`Login failed: ${error.message}`);
      }
      return null;
    }
  }

  // --- Signup (Still uses email for Firebase Auth, but username for profile) ---
  static async signup(email: string, password: string, name: string, username: string): Promise<AuthState | null> {
    // 1. Check if username is already taken
    const qUsername = query(this.usersCollectionRef, where("username", "==", username));
    const snapshotUsername = await getDocs(qUsername);
    if (!snapshotUsername.empty) {
      alert("Username is already taken.");
      return null;
    }

    // 2. Check if email is already used in Firestore profiles (optional, but good for UX)
    // Firebase Auth handles email uniqueness, but this checks if a profile already exists.
    const qEmail = query(this.usersCollectionRef, where("email", "==", email));
    const snapshotEmail = await getDocs(qEmail);
    if (!snapshotEmail.empty) {
        alert("An account with this email already exists.");
        return null;
    }


    try {
      // 3. Create user in Firebase Authentication (using email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 4. Create user profile in Firestore
      const newUserProfile: Omit<User, 'id' | 'password'> & {email: string} = {
          name,
          username,
          email, // Store email in Firestore
          role: 'student', // Default role for signup
          createdAt: new Date(),
      };
      await setDoc(doc(db, "users", firebaseUser.uid), newUserProfile);

      const authState: AuthState = { isAuthenticated: true, user: { ...newUserProfile, id: firebaseUser.uid, password: '' } };
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(authState));
      return authState;

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            alert('This email address is already in use by another account (Firebase Auth).');
        } else if (error.code === 'auth/weak-password') {
            alert('Password should be at least 6 characters.');
        } else {
            console.error("Signup failed:", error);
            alert('An error occurred during signup: ' + error.message);
        }
        return null;
    }
  }

  static logout(): void {
    signOut(auth);
    localStorage.removeItem(this.AUTH_KEY);
  }

  // --- Helper Functions ---
  static isAdmin(auth: AuthState): boolean {
    return auth.isAuthenticated && auth.user?.role === 'admin';
  }
  static isTeacher(auth: AuthState): boolean {
    return auth.isAuthenticated && auth.user?.role === 'teacher';
  }
  static isStudent(auth: AuthState): boolean {
    return auth.isAuthenticated && auth.user?.role === 'student';
  }

  // --- User Management (For Admins) ---
  static async getUsers(): Promise<User[]> {
      const snapshot = await getDocs(this.usersCollectionRef);
      return snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as User[];
  }

  // Note: Deleting a user's Firestore profile does NOT delete their Firebase Auth account.
  // Deleting the Auth user typically requires Firebase Admin SDK on a server.
  static async updateUserRole(userId: string, newRole: 'student' | 'teacher'): Promise<void> {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, { role: newRole });
  }

  static async deleteUser(userId: string): Promise<boolean> {
      try {
          const docRef = doc(db, "users", userId);
          await deleteDoc(docRef);
          // Ideally, also delete the Auth user via Admin SDK
          return true;
      } catch (error) {
          console.error("Error deleting user document:", error);
          return false;
      }
  }
}