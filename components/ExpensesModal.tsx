
import React, { useState } from 'react';
import { X, Wallet, Trash2, Plus, DollarSign, Calendar } from 'lucide-react';
import { Expense } from '../types';

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const ExpensesModal: React.FC<ExpensesModalProps> = ({
  isOpen,
  onClose,
  expenses,
  onAdd,
  onDelete,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Operational');

  if (!isOpen) return null;

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description || isNaN(numAmount) || numAmount <= 0) return;

    onAdd({
      description,
      amount: numAmount,
      category,
      date: new Date().toISOString(),
    });

    setDescription('');
    setAmount('');
    setCategory('Operational');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-2 rounded-lg">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Expenses Management</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage outgoing funds</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side: Add New Expense */}
          <div className="w-1/3 border-r border-slate-100 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800/50 overflow-y-auto">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
               <Plus size={18} className="text-rose-500" /> New Expense
             </h3>
             
             <form onSubmit={handleAdd} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                 <input 
                   type="text" 
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm dark:text-white shadow-sm"
                   placeholder="e.g. Vegetables Supply"
                   required
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Amount (₱)</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-3 pl-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm dark:text-white shadow-sm font-mono"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                 <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm dark:text-white shadow-sm"
                 >
                    <option value="Operational">Operational</option>
                    <option value="Ingredients">Ingredients</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Staff">Staff</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                 </select>
               </div>

               <button 
                 type="submit"
                 className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
               >
                 <Plus size={16} /> Add Expense
               </button>
             </form>

             <div className="mt-8 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">₱{totalExpenses.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400 mt-1">{expenses.length} records found</p>
             </div>
          </div>

          {/* Right Side: List */}
          <div className="flex-1 bg-white dark:bg-slate-900 p-0 overflow-y-auto">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                   <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700">Date</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700">Description</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700">Category</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right border-b border-slate-100 dark:border-slate-700">Amount</th>
                      <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right border-b border-slate-100 dark:border-slate-700">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {expenses.length === 0 ? (
                      <tr>
                         <td colSpan={5} className="p-8 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                               <DollarSign size={32} className="opacity-20" />
                               <p>No expenses recorded yet.</p>
                            </div>
                         </td>
                      </tr>
                   ) : (
                      expenses.map((expense) => (
                         <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                               <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-slate-400" />
                                  {new Date(expense.date).toLocaleDateString()}
                               </div>
                            </td>
                            <td className="p-4 text-sm font-bold text-slate-800 dark:text-white">
                               {expense.description}
                            </td>
                            <td className="p-4 text-sm">
                               <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                                 {expense.category}
                               </span>
                            </td>
                            <td className="p-4 text-sm font-bold text-right text-rose-600 dark:text-rose-400">
                               ₱{expense.amount.toFixed(2)}
                            </td>
                            <td className="p-4 text-right">
                               <button 
                                  onClick={() => onDelete(expense.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete Expense"
                               >
                                  <Trash2 size={16} />
                               </button>
                            </td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
};
