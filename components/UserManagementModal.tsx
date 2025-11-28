
import React, { useState } from 'react';
import { User } from '../types';
import { X, Users, Trash2, Plus, Shield, User as UserIcon, Calendar, Power, Clock, CheckCircle, Edit2 } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  currentUser: User;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onDeleteUser,
  onUpdateUser,
  currentUser
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user' as 'admin' | 'user'
  });
  const [editingDateId, setEditingDateId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDefaultAdmin = currentUser.isDefaultAdmin === true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logic for new user validity
    const now = new Date();
    // 35 Days validity for new Admins, standard users (cashiers) effectively infinite unless specified
    const validUntil = formData.role === 'admin' 
       ? new Date(now.getTime() + (35 * 24 * 60 * 60 * 1000)).toISOString()
       : null;

    onAddUser({
       ...formData,
       isActive: true,
       validUntil
    });
    setFormData({ username: '', password: '', name: '', role: 'user' });
  };

  const handleExtendValidity = (user: User, days: number) => {
    const currentExpiry = user.validUntil ? new Date(user.validUntil).getTime() : Date.now();
    // If expired, start from now. If valid, extend from current expiry.
    const baseTime = currentExpiry < Date.now() ? Date.now() : currentExpiry;
    const newDate = new Date(baseTime + (days * 24 * 60 * 60 * 1000)).toISOString();
    onUpdateUser(user.id, { validUntil: newDate, isActive: true });
  };

  const handleManualDateChange = (user: User, dateStr: string) => {
    if (!dateStr) return;
    const date = new Date(dateStr);
    // Set to end of day to be inclusive
    date.setHours(23, 59, 59, 999);
    onUpdateUser(user.id, { validUntil: date.toISOString(), isActive: true });
    setEditingDateId(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">User Management</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage access, roles, and validity</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Add User */}
          <div className="w-80 border-r border-slate-100 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800/50 overflow-y-auto shrink-0">
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
                  
                  {isDefaultAdmin && (
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
                  )}
                </div>
                {!isDefaultAdmin && (
                    <p className="text-[10px] text-slate-400 mt-1">Only Default Admin can add new Admin accounts.</p>
                )}
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
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700">Status</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700">Expires</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right border-b border-slate-100 dark:border-slate-700">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {users.map(user => {
                     const isExpired = user.validUntil ? new Date() > new Date(user.validUntil) : false;
                     const isSelf = user.id === currentUser.id;
                     const userIsDefaultAdmin = user.isDefaultAdmin === true;
                     const isEditingDate = editingDateId === user.id;

                     return (
                     <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="p-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1">
                                    {user.name}
                                    {userIsDefaultAdmin && <Shield size={10} className="text-amber-500" />}
                                </div>
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
                        <td className="p-4">
                            {user.isActive === false ? (
                                <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md border border-red-100 dark:border-red-900/30">Inactive</span>
                            ) : (
                                <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md border border-green-100 dark:border-green-900/30">Active</span>
                            )}
                        </td>
                        <td className="p-4">
                             {isEditingDate ? (
                                <input 
                                    type="date" 
                                    className="text-xs p-1 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                                    defaultValue={user.validUntil ? new Date(user.validUntil).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleManualDateChange(user, e.target.value)}
                                    onBlur={() => setEditingDateId(null)}
                                    autoFocus
                                />
                             ) : (
                                <div 
                                    className={`group/date flex items-center gap-2 ${isDefaultAdmin && !userIsDefaultAdmin ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 p-1 -m-1 rounded' : ''}`}
                                    onClick={() => {
                                        if (isDefaultAdmin && !userIsDefaultAdmin) setEditingDateId(user.id);
                                    }}
                                    title={isDefaultAdmin && !userIsDefaultAdmin ? "Click to edit date" : ""}
                                >
                                    {user.validUntil ? (
                                        <div className={`text-xs font-medium flex flex-col ${isExpired ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} /> {new Date(user.validUntil).toLocaleDateString()}
                                            </span>
                                            {isExpired && <span className="text-[10px] font-bold">EXPIRED</span>}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400">Never</span>
                                    )}
                                    {isDefaultAdmin && !userIsDefaultAdmin && (
                                        <Edit2 size={10} className="opacity-0 group-hover/date:opacity-100 text-slate-400" />
                                    )}
                                </div>
                             )}
                        </td>
                        <td className="p-4 text-right">
                           <div className="flex justify-end gap-1">
                               {/* Only Default Admin can manage validity/status of others */}
                               {isDefaultAdmin && !userIsDefaultAdmin && (
                                   <>
                                     <button 
                                       onClick={() => onUpdateUser(user.id, { isActive: !user.isActive })}
                                       className={`p-1.5 rounded-md transition-colors ${user.isActive === false ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'}`}
                                       title={user.isActive === false ? "Activate User" : "Deactivate User"}
                                     >
                                        <Power size={14} />
                                     </button>

                                     {user.role === 'admin' && (
                                        <>
                                            <button 
                                                onClick={() => handleExtendValidity(user, 31)}
                                                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                                title="Extend 31 Days"
                                            >
                                                <div className="flex items-center text-[10px] font-bold">+31D</div>
                                            </button>
                                            <button 
                                                onClick={() => handleExtendValidity(user, 365)}
                                                className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                                                title="Extend 1 Year"
                                            >
                                                <div className="flex items-center text-[10px] font-bold">+1Y</div>
                                            </button>
                                        </>
                                     )}

                                     <button 
                                       onClick={() => onDeleteUser(user.id)}
                                       className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                       title="Delete User"
                                     >
                                       <Trash2 size={14} />
                                     </button>
                                   </>
                               )}
                               
                               {!isDefaultAdmin && !isSelf && (
                                   <span className="text-[10px] text-slate-300 italic">Locked</span>
                               )}
                               {isSelf && <span className="text-[10px] text-slate-400 italic px-2">You</span>}
                           </div>
                        </td>
                     </tr>
                   )})}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
};
