import React, { useState } from 'react';
import { User } from '../types';
import { Users, Shield, UserCheck, Trash2, Plus, X, Edit } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface AdminUserManagementProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
  onCreateUser: (name: string, username: string, pass: string, role: 'student' | 'teacher') => Promise<boolean>;
  onUpdateUserRole: (userId: string, newRole: 'student' | 'teacher') => Promise<void>;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users, onDeleteUser, onCreateUser, onUpdateUserRole }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToProcess, setUserToProcess] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({ name: '', username: '', password: '', role: 'student' as 'student' | 'teacher' });
  const [error, setError] = useState('');

  const openDeleteModal = (user: User) => {
    setUserToProcess(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToProcess) {
      onDeleteUser(userToProcess.id);
      setIsDeleteModalOpen(false);
      setUserToProcess(null);
    }
  };
  
  const openEditModal = (user: User) => {
    setUserToProcess(user);
    setIsEditModalOpen(true);
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
  
  const handleEditRoleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (userToProcess) {
        await onUpdateUserRole(userToProcess.id, userToProcess.role as 'student' | 'teacher');
        setIsEditModalOpen(false);
        setUserToProcess(null);
      }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete User"
        message={`Are you sure you want to delete the user "${userToProcess?.name}"? This action cannot be undone.`}
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
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200"><X className="h-5 w-5 text-gray-500" /></button>
                    </div>
                    {/* Form fields... */}
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Create User</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && userToProcess && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleEditRoleSubmit}>
                <div className="p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Edit User: {userToProcess.name}</h2>
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200"><X className="h-5 w-5 text-gray-500" /></button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select value={userToProcess.role} onChange={e => setUserToProcess({...userToProcess, role: e.target.value as 'student' | 'teacher'})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Save Changes</button>
                </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">View, create, edit, and delete users.</p>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-5 w-5 mr-2" />Create User
            </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'teacher' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {user.role !== 'admin' && (
                          <div className="flex justify-end items-center space-x-4">
                            <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                          </div>
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

export default AdminUserManagement;
