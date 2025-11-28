
import React, { useState } from 'react';
import { Lock, AlertOctagon, Key, ShieldCheck } from 'lucide-react';

interface SubscriptionLockScreenProps {
  onActivate: (code: string) => boolean;
}

export const SubscriptionLockScreen: React.FC<SubscriptionLockScreenProps> = ({ onActivate }) => {
  const [activationCode, setActivationCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) return;

    const success = onActivate(activationCode);
    if (success) {
      setActivationCode('');
      setError('');
    } else {
      setError('Invalid activation code.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-rose-600"></div>

        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700">
          <Lock size={32} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Subscription Expired</h1>
        <p className="text-slate-400 mb-6">
          Your free trial has ended. Please contact your provider to activate your account.
        </p>

        <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700 text-sm">
           <p className="text-slate-300 font-medium mb-1 flex items-center justify-center gap-2">
              <AlertOctagon size={16} className="text-amber-500" /> Action Required
           </p>
           <p className="text-slate-500">
              Only the Default Admin can activate this account by generating an activation code.
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
             <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
               type="text" 
               value={activationCode}
               onChange={(e) => setActivationCode(e.target.value)}
               className="w-full bg-slate-900 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none uppercase tracking-wider font-mono placeholder:normal-case"
               placeholder="XXXX-A30-XXXX"
               autoFocus
             />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-bold animate-pulse">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-900/20 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} /> Activate Account
          </button>
        </form>
      </div>
    </div>
  );
};
