import { collection, addDoc, query, orderBy, getDocs, doc, updateDoc, arrayUnion, where, deleteDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';

export interface Notification {
    id: string;
    title: string;
    message: string;
    authorName: string;
    authorRole: 'admin' | 'teacher';
    targetRole: 'all' | 'student' | 'teacher';
    createdAt: Date;
    isReadBy: string[];
    totalUsersNotified: number;
}

export class NotificationService {
    private static readonly notificationsCollectionRef = collection(db, "notifications");
    private static readonly usersCollectionRef = collection(db, "users");

    /**
     * Creates a new notification document in Firestore.
     */
    static async createNotification(title: string, message: string, author: User, targetRole: 'all' | 'student' | 'teacher'): Promise<void> {
        if (!message.trim() || !title.trim()) return;

        let targetUserCount = 0;
        if (targetRole === 'all') {
            const snapshot = await getCountFromServer(this.usersCollectionRef);
            targetUserCount = snapshot.data().count;
        } else {
            const q = query(this.usersCollectionRef, where("role", "==", targetRole));
            const snapshot = await getCountFromServer(q);
            targetUserCount = snapshot.data().count;
        }
        
        const newNotification = {
            title,
            message,
            authorName: author.name,
            authorRole: author.role,
            targetRole,
            createdAt: new Date(),
            isReadBy: [],
            totalUsersNotified: targetUserCount,
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
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt.toDate(),
            } as Notification;
        });
    }

    /**
     * Fetches notifications that the specified user has NOT read and are targeted to them.
     */
    static async getUnreadNotifications(user: User): Promise<Notification[]> {
        // Fetch notifications where the user's ID is NOT in 'isReadBy'
        const q = query(this.notificationsCollectionRef, where('isReadBy', 'not-in', [user.id]), orderBy('isReadBy'));
        const snapshot = await getDocs(q);

        const unreadNotifications = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt.toDate(),
                } as Notification;
            })
            // Filter on the client-side to check the role targeting
            .filter(notif => notif.targetRole === 'all' || notif.targetRole === user.role);

        return unreadNotifications;
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