
import React, { useState } from 'react';
import { CartItem } from '../types';
import { Minus, Plus, Trash2, ShoppingBag, XCircle, AlertTriangle, PenTool } from 'lucide-react';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  discountValue: number;
  setDiscountValue: (value: number) => void;
  discountType?: 'percent' | 'fixed';
  setDiscountType?: (type: 'percent' | 'fixed') => void;
  customerName: string;
  isEditing?: boolean;
  isFullscreen?: boolean;
}

export const Cart: React.FC<CartProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  discountValue,
  setDiscountValue,
  discountType = 'fixed',
  setDiscountType,
  customerName,
  isEditing = false,
  isFullscreen = false,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate Discount Amount
  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = subtotal * (discountValue / 100);
  } else {
    discountAmount = discountValue;
  }
  
  // Cap Discount
  const finalDiscount = Math.min(Math.max(0, discountAmount), subtotal);
  const total = Math.max(0, subtotal - finalDiscount);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value) || 0;
    if (val < 0) val = 0;
    setDiscountValue(val);
  };

  // Only show scrollbar if items > 12
  const enableScroll = cartItems.length > 12;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-l-4 border-slate-300 dark:border-slate-600 shadow-xl transition-colors duration-300 relative">
      {/* Header */}
      <div className={`p-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 z-10 transition-colors duration-300 shrink-0 h-[60px] ${isEditing ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-white dark:bg-slate-800'}`}>
        <div className={`p-1.5 rounded-lg ${isEditing ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'}`}>
          {isEditing ? <PenTool size={20} /> : <ShoppingBag size={20} />}
        </div>
        <div className="flex flex-col items-start gap-0.5">
           <h2 className="text-base font-bold text-slate-800 dark:text-white leading-none">
             {isEditing ? 'Editing Order' : 'Current Order'}
           </h2>
           <span className="text-sm font-extrabold text-white bg-red-500 dark:bg-red-600 px-2 py-0.5 rounded-md shadow-sm border border-red-600 dark:border-red-500 truncate max-w-[90px] leading-none">
             {customerName}
           </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
            {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          </span>
          {cartItems.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
              title="Clear Cart"
            >
              <XCircle size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List - 2 Column Grid with List-Style Cards */}
      <div 
        className={`flex-1 p-2 ${enableScroll ? 'overflow-y-auto' : 'overflow-y-hidden'}`}
        dir={enableScroll ? "rtl" : "ltr"}
      >
        <div dir="ltr" className="h-full">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500 text-center p-8">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No items in order yet.</p>
              <p className="text-xs mt-1">Select items from the menu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 content-start">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 p-2 hover:border-brand-300 dark:hover:border-brand-600 transition-colors group relative h-full">
                  
                  {/* Left: Image */}
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-600 shrink-0 border border-slate-100 dark:border-slate-600">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                  </div>

                  {/* Right: Details & Controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                      {/* Name & Delete */}
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-tight line-clamp-2" title={item.name}>
                            {item.name}
                        </h4>
                        <button 
                            onClick={() => setItemToDelete(item.id)}
                            className="text-slate-300 hover:text-red-500 p-0.5 -mr-1 -mt-1 shrink-0"
                            title="Remove Item"
                        >
                            <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Price & Quantity Row */}
                      <div className="flex items-end justify-between mt-1">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            ₱{(item.price * item.quantity).toFixed(0)}
                        </span>

                        {/* Quantity Control */}
                        <div className="flex items-center bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-500 h-5 shadow-sm">
                            <button 
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-l transition-colors"
                                disabled={item.quantity <= 1}
                            >
                                <Minus size={8} />
                            </button>
                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100 px-1 min-w-[12px] text-center">
                            {item.quantity}
                            </span>
                            <button 
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-r transition-colors"
                            >
                                <Plus size={8} />
                            </button>
                        </div>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Totals */}
      <div className="p-3 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700 space-y-2 transition-colors duration-300 shrink-0">
        
        {/* Discount Section */}
        <div className="flex items-center justify-between mb-1 pb-2 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Discount</span>
              {setDiscountType && (
                <div className="flex bg-slate-200 dark:bg-slate-600 rounded p-0.5">
                   <button 
                     onClick={() => setDiscountType('fixed')}
                     className={`px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${discountType === 'fixed' ? 'bg-white dark:bg-slate-800 shadow text-brand-600' : 'text-slate-500 dark:text-slate-400'}`}
                   >₱</button>
                   <button 
                     onClick={() => setDiscountType('percent')}
                     className={`px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${discountType === 'percent' ? 'bg-white dark:bg-slate-800 shadow text-brand-600' : 'text-slate-500 dark:text-slate-400'}`}
                   >%</button>
                </div>
              )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                  type="number" 
                  min="0"
                  value={discountValue || ''} 
                  onChange={handleDiscountChange}
                  className="w-20 px-2 py-1 text-right text-sm font-bold border border-slate-200 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-800 dark:text-white pr-5"
                  placeholder="0"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">
                  {discountType === 'percent' ? '%' : '₱'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm font-medium">
          <span>Subtotal</span>
          <span>₱{subtotal.toFixed(2)}</span>
        </div>
        
        {finalDiscount > 0 && (
          <div className="flex justify-between text-brand-600 dark:text-brand-400 text-sm font-medium">
            <span>Discount {discountType === 'percent' ? `(${discountValue}%)` : ''}</span>
            <span>-₱{finalDiscount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-slate-900 dark:text-white font-bold text-xl pt-2 border-t border-slate-200 dark:border-slate-600">
          <span>Total</span>
          <span>₱{total.toFixed(2)}</span>
        </div>

        <button
          onClick={onCheckout}
          disabled={cartItems.length === 0}
          className={`w-full py-3 rounded-xl font-bold shadow-lg shadow-slate-200 dark:shadow-none transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-2 text-sm text-white ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700'} disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed`}
        >
          {isEditing ? 'Update Order' : 'Pay Now'}
        </button>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 rounded-l-lg" dir="ltr">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xs animate-in fade-in zoom-in duration-200 p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-3">
                    <AlertTriangle size={24} />
                 </div>
                 <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Are you sure you want to delete?</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    This will remove all items from your order{isEditing && ' and cancel edit mode'}.
                 </p>
                 <div className="flex gap-3 w-full">
                    <button 
                       onClick={() => setShowClearConfirm(false)}
                       className="flex-1 py-2.5 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                       No
                    </button>
                    <button 
                       onClick={() => {
                          onClearCart();
                          setShowClearConfirm(false);
                       }}
                       className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
                    >
                       Yes
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Item Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 rounded-l-lg" dir="ltr">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xs animate-in fade-in zoom-in duration-200 p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-3">
                    <Trash2 size={24} />
                 </div>
                 <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Are you sure you want to delete?</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Removing item from cart.
                 </p>
                 <div className="flex gap-3 w-full">
                    <button 
                       onClick={() => setItemToDelete(null)}
                       className="flex-1 py-2.5 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                       No
                    </button>
                    <button 
                       onClick={() => {
                          if (itemToDelete) onRemoveItem(itemToDelete);
                          setItemToDelete(null);
                       }}
                       className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
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
