import React, { useState } from 'react';
import { User } from '../types';
import { Users, Shield, UserCheck, Trash2, Plus, X } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface UserManagementProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
  onCreateUser: (name: string, username: string, pass: string, role: 'student' | 'teacher') => Promise<boolean>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onDeleteUser, onCreateUser }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [newUserData, setNewUserData] = useState({ name: '', username: '', password: '', role: 'student' as 'student' | 'teacher' });
  const [error, setError] = useState('');

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await onCreateUser(newUserData.name, newUserData.username, newUserData.password, newUserData.role);
    if (success) {
        setIsCreateModalOpen(false);
        setNewUserData({ name: '', username: '', password: '', role: 'student' });
    } else {
        setError('Username already exists. Please choose another.');
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete User"
        message={`Are you sure you want to delete the user "${userToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleCreateUserSubmit}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200">
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" required value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input type="text" required value={newUserData.username} onChange={e => setNewUserData({...newUserData, username: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" required value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value as 'student' | 'teacher'})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Create User</button>
                </div>
            </form>
          </div>
        </div>
      )}


      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <Users className="h-8 w-8 mr-3 text-blue-600" />
                    User Management
                </h1>
                <p className="text-gray-600">View and manage all registered users in the system.</p>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create User
            </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'teacher' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role === 'teacher' && <UserCheck className="h-3 w-3 mr-1" />}
                        {user.role === 'student' && <Users className="h-3 w-3 mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role !== 'admin' && (
                          <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-900 transition-colors flex items-center ml-auto">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                          </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagement;