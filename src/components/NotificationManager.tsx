import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Notification, NotificationService } from '../services/notificationService';
import { Send, Bell, Trash2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface NotificationManagerProps {
    currentUser: User;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ currentUser }) => {
    const [newMessage, setNewMessage] = useState('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);

    const fetchNotifications = async () => {
        const allNotifications = await NotificationService.getAllNotifications();
        setNotifications(allNotifications);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await NotificationService.createNotification(newMessage, currentUser);
        await fetchNotifications(); // Refresh the list
        setNewMessage('');
        setIsLoading(false);
    };

    const openDeleteModal = (notification: Notification) => {
        setNotificationToDelete(notification);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (notificationToDelete) {
            await NotificationService.deleteNotification(notificationToDelete.id);
            // Optimistically update UI for instant feedback
            setNotifications(current => current.filter(n => n.id !== notificationToDelete.id));
            setIsDeleteModalOpen(false);
            setNotificationToDelete(null);
        }
    };

    return (
        <>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete Notification"
                message={`Are you sure you want to permanently delete this notification?`}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
            <div>
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Send a New Announcement</h2>
                    <form onSubmit={handleSendNotification}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            required
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {isLoading ? 'Sending...' : 'Send Announcement'}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                     <h2 className="text-xl font-bold text-gray-800 mb-4">Sent History</h2>
                     <div className="space-y-4 max-h-96 overflow-y-auto">
                        {notifications.map(notif => (
                            <div key={notif.id} className="p-4 border rounded-md bg-gray-50 flex justify-between items-start">
                                <div>
                                    <p className="text-gray-800">{notif.message}</p>
                                    <div className="text-xs text-gray-500 mt-2">
                                        Sent by {notif.authorName} ({notif.authorRole}) on {new Date(notif.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                {currentUser.role === 'admin' && (
                                    <button 
                                        onClick={() => openDeleteModal(notif)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                        aria-label="Delete notification"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </>
    );
};

export default NotificationManager;