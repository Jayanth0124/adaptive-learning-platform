import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Notification, NotificationService } from '../services/notificationService';
import { Send, Trash2, Users, Info, AlertTriangle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface NotificationManagerProps {
    currentUser: User;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ currentUser }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState<'all' | 'student' | 'teacher'>('all');
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
        await NotificationService.createNotification(title, message, currentUser, targetRole);
        await fetchNotifications(); // Refresh the list
        setTitle('');
        setMessage('');
        setIsLoading(false);
    };

    const openDeleteModal = (notification: Notification) => {
        setNotificationToDelete(notification);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (notificationToDelete) {
            await NotificationService.deleteNotification(notificationToDelete.id);
            setNotifications(current => current.filter(n => n.id !== notificationToDelete.id));
            setIsDeleteModalOpen(false);
            setNotificationToDelete(null);
        }
    };
    
    const getAudienceLabel = (target: 'all' | 'student' | 'teacher') => {
        if (target === 'student') return 'Students Only';
        if (target === 'teacher') return 'Teachers Only';
        return 'All Users';
    };

    return (
        <>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete Notification"
                message={`Are you sure you want to permanently delete this announcement?`}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
            <div>
                 <h1 className="text-3xl font-bold text-gray-900 mb-1">Notifications</h1>
                 <p className="text-gray-600 mb-6">Send and manage announcements for your users.</p>

                <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Send a New Announcement</h2>
                    <form onSubmit={handleSendNotification} className="space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Upcoming Maintenance" className="w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here..."
                                className="w-full p-2 border rounded-md"
                                rows={4}
                                required
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                             <select value={targetRole} onChange={(e) => setTargetRole(e.target.value as any)} className="w-full p-2 border rounded-md bg-white">
                                 <option value="all">All Users</option>
                                 <option value="student">Students Only</option>
                                 <option value="teacher">Teachers Only</option>
                             </select>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {isLoading ? 'Sending...' : 'Send Announcement'}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                     <h2 className="text-xl font-bold text-gray-800 mb-4">Sent History</h2>
                     <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {notifications.map(notif => (
                            <div key={notif.id} className="p-4 border rounded-md bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                notif.targetRole === 'student' ? 'bg-green-100 text-green-800' :
                                                notif.targetRole === 'teacher' ? 'bg-indigo-100 text-indigo-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {getAudienceLabel(notif.targetRole)}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-800">{notif.title}</h3>
                                        <p className="text-gray-700 mt-1">{notif.message}</p>
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
                                <div className="text-xs text-gray-500 mt-3 flex justify-between items-center">
                                    <span>Sent by {notif.authorName} ({notif.authorRole}) on {new Date(notif.createdAt).toLocaleString()}</span>
                                    <span className="font-medium">
                                        Read by: {notif.isReadBy.length} / {notif.totalUsersNotified}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {notifications.length === 0 && <p className="text-center text-gray-500 py-6">No announcements sent yet.</p>}
                     </div>
                </div>
            </div>
        </>
    );
};

export default NotificationManager;