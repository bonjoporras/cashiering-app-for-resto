import React from 'react';
import { MenuItem } from '../types';
import { Plus } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col"
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
          ₱{item.price.toFixed(2)}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-slate-800 leading-tight">{item.name}</h3>
        </div>
        
        <button 
          onClick={() => onAddToCart(item)}
          className="w-full mt-auto bg-slate-50 hover:bg-brand-50 text-brand-600 font-medium py-2 px-4 rounded-lg border border-slate-200 hover:border-brand-200 transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={18} />
          Add to Order
        </button>
      </div>
    </div>
  );
};
