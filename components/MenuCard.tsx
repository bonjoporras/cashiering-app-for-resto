
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
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-4 border-slate-300 dark:border-slate-600 overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col h-full"
    >
      {/* Image Section - Increased height from h-32 to h-48 for better visibility */}
      <div className="relative h-48 overflow-hidden bg-gray-50 dark:bg-gray-700 border-b border-slate-200 dark:border-slate-600">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Compact Price Tag */}
        <div className="absolute top-1.5 right-1.5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[10px] font-bold text-slate-800 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700">
          ₱{item.price.toFixed(2)}
        </div>
      </div>
      
      {/* Content Section - Compact */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex flex-col items-start gap-1">
           <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide border border-slate-200 dark:border-slate-600">
             {item.category}
           </span>
           <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight line-clamp-2 min-h-[2.5em]" title={item.name}>
             {item.name}
           </h3>
        </div>
        
        <button 
          onClick={() => onAddToCart(item)}
          className="w-full mt-auto bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-2 rounded-lg border border-slate-300 dark:border-slate-500 transition-colors flex items-center justify-center gap-1 active:scale-95 text-xs uppercase tracking-wide"
        >
          <Plus size={16} />
          Add
        </button>
      </div>
    </div>
  );
};
