import React from 'react';
import { Customer } from '../types';
import { UserPlus, Mail, Phone, Award, MoreHorizontal } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
}

export const CustomerList: React.FC<CustomerListProps> = ({ customers }) => {
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Grid List */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {customers.length > 0 ? (
            customers.map((customer) => (
              <div 
                key={customer.id} 
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-200 group flex flex-col relative"
              >
                <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={20} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg shrink-0">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="min-w-0 pr-6">
                    <h3 className="font-bold text-slate-900 truncate">{customer.name}</h3>
                    <p className="text-xs text-slate-400 truncate">ID: {customer.id}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{customer.email}</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{customer.phone}</span>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-xs font-bold border border-amber-100">
                    <Award size={12} />
                    {customer.loyaltyPoints} pts
                  </div>
                  
                  <div className="text-right">
                     <div className="text-xs font-bold text-slate-700">{customer.visits} Visits</div>
                     <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                        Last: {new Date(customer.lastVisit).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
              <UserPlus size={48} className="opacity-20 mb-4" />
              <p>No customers found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};