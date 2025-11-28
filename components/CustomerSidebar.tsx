
import React, { useState } from 'react';
import { Customer, AppSettings } from '../types';
import { Plus, Users, ShoppingBag, Edit2, Trash2, UtensilsCrossed, Search } from 'lucide-react';

interface CustomerSidebarProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
  settings: AppSettings;
  isFullscreen?: boolean;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  settings,
  isFullscreen = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white dark:bg-slate-800 flex flex-col h-full shrink-0 z-10 transition-colors duration-300 border-r border-transparent dark:border-slate-700 relative">
       {/* App Branding Header */}
       <div className="px-6 flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0 h-[88px] transition-colors duration-300">
         <div className="flex items-center gap-3 overflow-hidden">
           <div className="bg-brand-600 text-white p-2 rounded-xl shadow-md shadow-brand-200 dark:shadow-none shrink-0 overflow-hidden w-10 h-10 flex items-center justify-center">
              {settings.appLogo === 'default' ? (
                 <UtensilsCrossed size={20} />
              ) : (
                 <img src={settings.appLogo} alt="Logo" className="w-full h-full object-contain" />
              )}
           </div>
           <div className="min-w-0">
               <h1 className="font-bold text-slate-900 dark:text-white text-lg leading-none tracking-tight truncate">{settings.appName}</h1>
               <p className="text-[10px] text-slate-400 font-medium mt-1">POS System</p>
           </div>
         </div>
       </div>

       {/* Search & Counts Sub-header */}
       <div className="p-3 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 shrink-0 space-y-2 transition-colors duration-300">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Users size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Customers</span>
              </div>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{customers.length}</span>
          </div>
          
          {/* Search Bar */}
          <div className="relative group">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={12} />
             <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-slate-400"
             />
          </div>
       </div>
       
       {/* List */}
       <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white dark:bg-slate-900/50 transition-colors duration-300">
         {filteredCustomers.length === 0 ? (
             <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                 <p className="text-xs">No customers found</p>
             </div>
         ) : (
             filteredCustomers.map(customer => {
               const isSelected = selectedCustomerId === customer.id;
               const isEditing = editingId === customer.id;
               const cartItemCount = customer.cart.reduce((acc, item) => acc + item.quantity, 0);
               const cartTotal = customer.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
               
               return (
                 <div
                   key={customer.id}
                   onClick={() => onSelectCustomer(customer)}
                   className={`w-full p-2 rounded-lg flex items-center gap-2 transition-all text-left group cursor-pointer border relative overflow-hidden ${
                     isSelected 
                       ? 'bg-white dark:bg-slate-800 border-brand-500 shadow-md ring-1 ring-brand-500 z-10' 
                       : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-700 shadow-sm'
                   }`}
                 >
                   {/* Selection Indicator Bar */}
                   {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>}

                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 shadow-inner border ${
                     isSelected ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 group-hover:bg-white dark:group-hover:bg-slate-600 group-hover:border-brand-200 dark:group-hover:border-brand-600 group-hover:text-brand-600 dark:group-hover:text-brand-400'
                   }`}>
                     {customer.name.charAt(0).toUpperCase()}
                   </div>
                   
                   <div className="min-w-0 flex-1">
                     <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1 pr-1">
                             {isEditing ? (
                               <div className="relative">
                                 <input 
                                   type="text"
                                   value={customer.name}
                                   onChange={(e) => onUpdateCustomer(customer.id, { name: e.target.value })}
                                   onKeyDown={handleKeyDown}
                                   onBlur={() => setEditingId(null)}
                                   onFocus={handleFocus}
                                   onClick={(e) => e.stopPropagation()}
                                   className="font-bold text-xs bg-transparent border-b border-brand-300 focus:border-brand-500 focus:outline-none w-full p-0 pr-0 rounded-none text-slate-900 dark:text-slate-100 placeholder-slate-300 leading-tight"
                                   placeholder="Name"
                                   autoFocus
                                 />
                               </div>
                             ) : (
                               <p className={`font-bold text-xs break-words break-all leading-tight transition-colors mb-0.5 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-300 group-hover:text-brand-700 dark:group-hover:text-brand-400'}`}>
                                 {customer.name}
                               </p>
                             )}
                        </div>

                        <div className={`flex items-center gap-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(customer.id);
                                if (!isSelected) onSelectCustomer(customer);
                              }}
                              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600 transition-all shrink-0 ${isSelected ? 'text-brand-400 hover:text-brand-600' : 'text-slate-300 hover:text-slate-500'}`}
                              title="Edit Name"
                          >
                              <Edit2 size={10} />
                          </button>
                          <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(customer.id);
                              }}
                              className={`p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0 ${isSelected ? 'text-red-300 hover:text-red-600' : 'text-slate-300 hover:text-red-500'}`}
                              title="Remove Customer"
                          >
                              <Trash2 size={10} />
                          </button>
                       </div>
                     </div>
                     
                     {cartItemCount > 0 && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md border w-fit mt-1.5 ${isSelected ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-brand-100 dark:border-brand-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'}`}>
                            <ShoppingBag size={8} />
                            <span>{cartItemCount} items</span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <span>₱{cartTotal.toFixed(0)}</span>
                        </div>
                     )}
                   </div>
                 </div>
               );
             })
         )}
       </div>
       
       {/* Fixed Footer with Add Button */}
       <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
         <button 
           onClick={onAddCustomer}
           className="w-full p-2.5 rounded-xl bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs font-bold active:scale-[0.98]"
         >
           <Plus size={16} />
           <span>Add Customer</span>
         </button>
       </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xs animate-in fade-in zoom-in duration-200 p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                 <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-3">
                    <Trash2 size={20} />
                 </div>
                 <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Delete Customer?</h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Are you sure you want to delete <br/>
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                        "{customers.find(c => c.id === deleteConfirmId)?.name}"
                    </span>?
                 </p>
                 <div className="flex gap-2 w-full">
                    <button 
                       onClick={() => setDeleteConfirmId(null)}
                       className="flex-1 py-2 rounded-lg font-bold text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                       No
                    </button>
                    <button 
                       onClick={() => {
                          if (deleteConfirmId) onDeleteCustomer(deleteConfirmId);
                          setDeleteConfirmId(null);
                       }}
                       className="flex-1 py-2 rounded-lg font-bold text-xs text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
                    >
                       Yes
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
