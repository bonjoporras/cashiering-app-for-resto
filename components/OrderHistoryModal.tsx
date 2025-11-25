
import React, { useState } from 'react';
import { X, Clock, ShoppingBag, Calendar, RotateCcw, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onRestore: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onRestore,
}) => {
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 p-2 rounded-lg">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Order History</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{orders.length} past transactions</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
          {orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Clock size={48} className="opacity-20" />
              <p>No past orders found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <div className="flex gap-4">
                      <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg h-fit">
                        <ShoppingBag size={24} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div>
                         <p className="font-bold text-slate-800 dark:text-white text-lg">Order #{order.id.slice(-4)}</p>
                         <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                            <Calendar size={12} /> {new Date(order.date).toLocaleString()}
                         </p>
                         {order.customerName && (
                           <p className="text-brand-600 dark:text-brand-400 text-xs font-bold mt-1">
                             {order.customerName}
                           </p>
                         )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                       <p className="text-2xl font-bold text-slate-800 dark:text-white">₱{order.total.toFixed(2)}</p>
                       <button
                         onClick={() => setConfirmOrder(order)}
                         className="flex items-center gap-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                       >
                         <RotateCcw size={16} /> Restore Order
                       </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                     <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Items</p>
                     <div className="space-y-1">
                        {order.items.map((item, idx) => (
                           <div key={idx} className="flex justify-between text-sm">
                              <span className="text-slate-700 dark:text-slate-300">
                                <span className="font-bold">{item.quantity}x</span> {item.name}
                              </span>
                              <span className="text-slate-500 dark:text-slate-400">₱{(item.price * item.quantity).toFixed(2)}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOrder && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xs animate-in fade-in zoom-in duration-200 p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                    <AlertCircle size={24} />
                 </div>
                 <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Restore Order?</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    This will replace the current cart and update the customer name to <br/>
                    <span className="font-bold text-slate-900 dark:text-slate-200">
                        "{confirmOrder.customerName || `Order #${confirmOrder.id.slice(-4)}`}"
                    </span>.
                 </p>
                 <div className="flex gap-3 w-full">
                    <button 
                       onClick={() => setConfirmOrder(null)}
                       className="flex-1 py-2.5 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                       No
                    </button>
                    <button 
                       onClick={() => {
                          onRestore(confirmOrder);
                          setConfirmOrder(null);
                          onClose();
                       }}
                       className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
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
};
