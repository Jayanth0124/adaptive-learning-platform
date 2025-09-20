import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { Users, Shield, UserCheck, Trash2, Plus, X, Edit, Search } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface AdminUserManagementProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
  onCreateUser: (name: string, username: string, pass: string, role: 'student' | 'teacher') => Promise<boolean>;
  onUpdateUserRole: (userId: string, newRole: 'student' | 'teacher') => Promise<void>;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
);

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ users, onDeleteUser, onCreateUser, onUpdateUserRole }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToProcess, setUserToProcess] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({ name: '', username: '', password: '', role: 'student' as 'student' | 'teacher' });
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.username.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }, [users, searchTerm, roleFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.filter(u => u.role !== 'admin').map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const openDeleteModal = (user: User) => {
    setUserToProcess(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToProcess) {
      onDeleteUser(userToProcess.id);
    } else if (selectedUsers.length > 0) {
      selectedUsers.forEach(id => onDeleteUser(id));
      setSelectedUsers([]);
    }
    setIsDeleteModalOpen(false);
    setUserToProcess(null);
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

  const studentCount = users.filter(u => u.role === 'student').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title={userToProcess ? "Delete User" : "Delete Selected Users"}
        message={userToProcess ? `Are you sure you want to delete "${userToProcess.name}"? This cannot be undone.` : `Are you sure you want to delete these ${selectedUsers.length} users? This cannot be undone.`}
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
                     <div className="space-y-4">
                        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" required value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input type="text" required value={newUserData.username} onChange={e => setNewUserData({...newUserData, username: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" required value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value as 'student' | 'teacher'})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md">
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
                        <select value={userToProcess.role} onChange={e => setUserToProcess({...userToProcess, role: e.target.value as 'student' | 'teacher'})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md">
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">View, create, edit, and delete users.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <StatCard title="Total Users" value={users.length} icon={Users} />
            <StatCard title="Students" value={studentCount} icon={UserCheck} />
            <StatCard title="Teachers" value={teacherCount} icon={Shield} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="w-full md:w-auto">
                 {selectedUsers.length > 0 && (
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">{selectedUsers.length} selected</span>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center text-red-600 text-sm font-medium">
                            <Trash2 className="h-4 w-4 mr-1"/> Delete Selected
                        </button>
                    </div>
                 )}
             </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                   <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" />
                  </div>
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border rounded-lg py-2 px-3 w-full sm:w-auto">
                      <option value="all">All Roles</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center w-full sm:w-auto justify-center">
                      <Plus className="h-5 w-5 mr-2" />Create User
                  </button>
              </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 w-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.filter(u => u.role !== 'admin').length} /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4">
                      {user.role !== 'admin' && <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)}/>}
                    </td>
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
                     <td className="px-6 py-4 text-sm text-gray-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
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