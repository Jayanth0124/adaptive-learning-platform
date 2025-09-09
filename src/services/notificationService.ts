import { collection, addDoc, query, orderBy, getDocs, doc, updateDoc, arrayUnion, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';

export interface Notification {
    id: string;
    message: string;
    authorName: string;
    authorRole: 'admin' | 'teacher';
    createdAt: Date;
    isReadBy: string[];
}

export class NotificationService {
    private static readonly notificationsCollectionRef = collection(db, "notifications");

    /**
     * Creates a new notification document in Firestore.
     */
    static async createNotification(message: string, author: User): Promise<void> {
        if (!message.trim()) return;
        
        const newNotification = {
            message,
            authorName: author.name,
            authorRole: author.role,
            createdAt: new Date(),
            isReadBy: [],
        };
        await addDoc(this.notificationsCollectionRef, newNotification);
    }
    
    /**
     * Deletes a notification document from Firestore.
     */
    static async deleteNotification(notificationId: string): Promise<void> {
        const docRef = doc(db, "notifications", notificationId);
        await deleteDoc(docRef);
    }

    /**
     * Fetches all notifications, sorted by the most recent.
     */
    static async getAllNotifications(): Promise<Notification[]> {
        const q = query(this.notificationsCollectionRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Notification[];
    }

    /**
     * Fetches notifications that the specified user has NOT read.
     */
    static async getUnreadNotifications(userId: string): Promise<Notification[]> {
        const q = query(this.notificationsCollectionRef, where('isReadBy', 'not-in', [userId]), orderBy('isReadBy'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Notification[];
    }
    
    /**
     * Marks a set of notifications as read for a given user.
     */
    static async markNotificationsAsRead(notificationIds: string[], userId: string): Promise<void> {
        if (notificationIds.length === 0) return;
        
        const updates = notificationIds.map(id => {
            const docRef = doc(db, "notifications", id);
            return updateDoc(docRef, {
                isReadBy: arrayUnion(userId)
            });
        });

        await Promise.all(updates);
    }
}