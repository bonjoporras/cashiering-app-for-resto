
import React, { useState } from 'react';
import { User } from '../types';
import { X, Users, Trash2, Plus, Shield, User as UserIcon } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
  currentUserId: string;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onDeleteUser,
  currentUserId
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user' as 'admin' | 'user'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser(formData);
    setFormData({ username: '', password: '', name: '', role: 'user' });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">User Management</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage access and roles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Add User */}
          <div className="w-1/3 border-r border-slate-100 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800/50 overflow-y-auto">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-500" /> Add New User
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Username</label>
                <input 
                  type="text" 
                  required
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="jdoe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Role</label>
                <div className="flex gap-2">
                  <label className={`flex-1 cursor-pointer border rounded-lg p-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${formData.role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                    <input 
                      type="radio" 
                      name="role" 
                      value="user" 
                      checked={formData.role === 'user'} 
                      onChange={() => setFormData({...formData, role: 'user'})}
                      className="hidden" 
                    />
                    <UserIcon size={16} /> User
                  </label>
                  <label className={`flex-1 cursor-pointer border rounded-lg p-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${formData.role === 'admin' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                    <input 
                      type="radio" 
                      name="role" 
                      value="admin" 
                      checked={formData.role === 'admin'} 
                      onChange={() => setFormData({...formData, role: 'admin'})}
                      className="hidden" 
                    />
                    <Shield size={16} /> Admin
                  </label>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-colors"
              >
                Create User
              </button>
            </form>
          </div>

          {/* Right: User List */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-0 overflow-y-auto">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                   <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700">User</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700">Role</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right border-b border-slate-100 dark:border-slate-700">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {users.map(user => (
                     <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-white text-sm">{user.name}</div>
                                <div className="text-xs text-slate-400">@{user.username}</div>
                              </div>
                           </div>
                        </td>
                        <td className="p-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                             user.role === 'admin' 
                             ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                             : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                           }`}>
                             {user.role.toUpperCase()}
                           </span>
                        </td>
                        <td className="p-4 text-right">
                           {user.id !== currentUserId ? (
                             <button 
                               onClick={() => onDeleteUser(user.id)}
                               className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                               title="Delete User"
                             >
                               <Trash2 size={16} />
                             </button>
                           ) : (
                             <span className="text-xs text-slate-400 italic">Current User</span>
                           )}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
};
