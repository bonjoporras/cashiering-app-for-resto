
import React, { useState, useRef } from 'react';
import { MenuItem, Order } from '../types';
import { Edit2, Trash2, X, Save, Search, Package, Upload, BarChart3, History, List, TrendingUp, DollarSign, ShoppingCart, RotateCcw, Plus, LayoutGrid, CalendarDays, Clock, Download, Lock } from 'lucide-react';

interface ProductManagementProps {
  items: MenuItem[];
  categories: string[];
  orders: Order[];
  onAdd: (item: MenuItem) => void;
  onUpdate: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onAddToCart: (item: MenuItem) => void;
  onDeleteOrder: (id: string) => void;
  onEditOrder: (order: Order) => void;
  onRestoreOrder: (order: Order) => void;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  activeTab: 'products' | 'sales' | 'history';
  onTabChange: (tab: 'products' | 'sales' | 'history') => void;
  currentUserRole: 'admin' | 'user';
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  items,
  categories,
  orders,
  onAdd,
  onUpdate,
  onDelete,
  onAddToCart,
  onDeleteOrder,
  onEditOrder,
  onRestoreOrder,
  onAddCategory,
  onDeleteCategory,
  activeTab,
  onTabChange,
  currentUserRole
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Quick Edit State
  const [quickEditingPriceId, setQuickEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  
  // Image Replacement State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);

  // Modal State (Shared for Add & Edit)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    category: '',
    imageUrl: '',
  });

  // Delete Confirmation State (Products & Categories)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'product' | 'category';
    id: string;
    name: string;
  } | null>(null);

  // Order Delete Confirmation State (Sales & History)
  const [orderDeleteConfirm, setOrderDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  } | null>(null);

  // Edit Confirmation State
  const [editConfirm, setEditConfirm] = useState<Order | null>(null);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Sales Metrics Calculations ---
  const now = new Date();
  const todayStr = now.toDateString();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Daily (Today)
  const dailyOrders = orders.filter(order => new Date(order.date).toDateString() === todayStr);
  const dailySales = dailyOrders.reduce((sum, order) => sum + order.total, 0);
  const dailyOrderCount = dailyOrders.length;

  // Monthly (Current Month)
  const monthlyOrders = orders.filter(order => {
    const d = new Date(order.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlySales = monthlyOrders.reduce((sum, order) => sum + order.total, 0);

  // Lifetime
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // --- Helper: Export CSV ---
  const handleExportCSV = (data: Order[], filename: string) => {
    if (data.length === 0) return;

    const headers = ['Order ID', 'Date', 'Time', 'Customer', 'Items', 'Total Amount (PHP)'];
    const csvRows = [headers.join(',')];

    data.forEach(order => {
      const dateObj = new Date(order.date);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString();
      // Escape quotes in item names and join with semicolon
      const itemsStr = `"${order.items.map(i => `${i.quantity}x ${i.name}`).join('; ').replace(/"/g, '""')}"`;
      const customerStr = `"${(order.customerName || 'Unknown').replace(/"/g, '""')}"`;
      
      const row = [
        `"${order.id}"`, // Quote ID to preserve format
        date,
        time,
        customerStr,
        itemsStr,
        order.total.toFixed(2)
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // --- Handlers ---

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: 0,
      category: selectedCategory === 'All' ? categories[0] || '' : selectedCategory,
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    // Pre-fill the form with the existing item's details
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Direct Image Replacement Handlers
  const handleDirectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && replacingImageId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const itemToUpdate = items.find(i => i.id === replacingImageId);
        if (itemToUpdate) {
           onUpdate({ ...itemToUpdate, imageUrl: reader.result as string });
        }
        setReplacingImageId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageReplacement = (id: string) => {
    setReplacingImageId(id);
    fileInputRef.current?.click();
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(formData.price?.toString() || '0');
    const category = formData.category?.trim() || 'Uncategorized';

    if (editingItem) {
      // Update existing
      onUpdate({ 
        ...editingItem,
        ...formData as MenuItem,
        price,
        category // Ensure trimmed category is used
      });
    } else {
      // Add new
      onAdd({
        id: Date.now().toString(),
        name: formData.name || 'New Product',
        price,
        category,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'
      });
    }
    setIsModalOpen(false);
  };

  // Inline Price Edit Handlers
  const startPriceEdit = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickEditingPriceId(item.id);
    setTempPrice(item.price.toString());
  };

  const savePriceEdit = (item: MenuItem) => {
    if (quickEditingPriceId !== item.id) return;

    const newPrice = parseFloat(tempPrice);
    if (!isNaN(newPrice) && newPrice >= 0) {
      onUpdate({ ...item, price: newPrice });
    }
    setQuickEditingPriceId(null);
  };

  const cancelPriceEdit = () => {
    setQuickEditingPriceId(null);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, item: MenuItem) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger blur to save
    } else if (e.key === 'Escape') {
      cancelPriceEdit();
    }
  };

  const renderProductTab = () => (
    <div className="flex flex-col h-full">
      {/* Header Container */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm z-10 flex flex-col transition-colors duration-300">
         
         {/* Top Row: Title, Toggle, Search, Actions */}
         <div className="px-4 py-3 flex items-center justify-between gap-3">
             <div className="flex items-center gap-3 shrink-0">
                <div className="hidden lg:block">
                  <h2 className="font-bold text-base text-slate-800 dark:text-white leading-none">Product List</h2>
                  <p className="text-xs text-slate-400 font-medium">{filteredItems.length} items found</p>
                </div>
                
                {/* View Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-0.5 rounded-md">
                    <button 
                        onClick={() => setViewMode('grid')} 
                        className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title="Grid View"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')} 
                        className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title="List View"
                    >
                        <List size={16} />
                    </button>
                </div>
             </div>

             {/* Search Bar */}
             <div className="relative flex-1 max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 pl-10 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all text-sm font-medium text-slate-900 dark:text-white"
                />
             </div>

             <div className="flex items-center gap-2">
               {/* Add Product Button */}
               <button 
                  onClick={handleOpenAddModal}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
               >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Product</span>
               </button>
             </div>
         </div>

         {/* Bottom Row: Category Filters */}
         <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${
                    selectedCategory === 'All'
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-brand-300 hover:text-brand-600'
                }`}
            >
                All
            </button>
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${
                        selectedCategory === cat
                        ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white'
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-brand-300 hover:text-brand-600'
                    }`}
                >
                    {cat}
                </button>
            ))}
         </div>
      </div>

      {/* Product Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto bg-white dark:bg-slate-900 transition-colors duration-300">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <Package size={48} className="opacity-20 mb-4" />
               <p className="text-sm">No products found.</p>
               <button 
                 onClick={handleOpenAddModal}
                 className="mt-2 text-brand-600 font-bold hover:underline text-sm"
               >
                 Add your first product
               </button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                /* --- GRID VIEW --- */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-6">
                   {categories.map(category => {
                     if (selectedCategory !== 'All' && category !== selectedCategory) return null;
                     const categoryItems = filteredItems.filter(item => item.category === category);
                     if (categoryItems.length === 0) return null;

                     return (
                       <React.Fragment key={category}>
                          {selectedCategory === 'All' && (
                            <div className="col-span-full mt-2 mb-1 border-b border-slate-200 dark:border-slate-700 pb-1.5 flex items-center justify-between group/catheader">
                               <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                                 {category}
                               </h3>
                               <button 
                                 onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDeleteConfirm({
                                      isOpen: true,
                                      type: 'category',
                                      id: category,
                                      name: category
                                    });
                                 }}
                                 className="text-slate-300 hover:text-red-500 opacity-0 group-hover/catheader:opacity-100 transition-opacity"
                                 title="Delete Category"
                               >
                                 <Trash2 size={14} />
                               </button>
                            </div>
                          )}

                          {categoryItems.map((item) => (
                             <div 
                               key={item.id} 
                               className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-4 border-slate-300 dark:border-slate-600 overflow-hidden hover:shadow-md transition-all group flex flex-col"
                             >
                                <div 
                                  className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-700 group/image cursor-pointer"
                                  onClick={() => triggerImageReplacement(item.id)}
                                >
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                  />
                                  
                                  {/* Hover Overlay for Replacement */}
                                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                      <div className="opacity-0 group-hover/image:opacity-100 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1 transform translate-y-2 group-hover/image:translate-y-0 transition-all">
                                          <Upload size={10} /> Click to Replace
                                      </div>
                                  </div>

                                  {/* Price Overlay (Click to Edit) */}
                                  <div 
                                    className="absolute bottom-0 right-0 bg-brand-600 text-white px-2 py-0.5 text-xs font-bold rounded-tl-lg shadow-sm z-10 cursor-pointer hover:bg-brand-700 transition-colors"
                                    onClick={(e) => startPriceEdit(e, item)}
                                    title="Click to edit price"
                                  >
                                    {quickEditingPriceId === item.id ? (
                                      <input 
                                        type="number" 
                                        value={tempPrice}
                                        onChange={(e) => setTempPrice(e.target.value)}
                                        onBlur={() => savePriceEdit(item)}
                                        onKeyDown={(e) => handlePriceKeyDown(e, item)}
                                        className="w-12 px-1 py-0 text-slate-900 text-xs rounded focus:outline-none"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      `₱${item.price}`
                                    )}
                                  </div>

                                  {/* Action Buttons Overlay */}
                                  <div className="absolute top-1 right-1 flex gap-1.5 opacity-0 group-hover/image:opacity-100 transition-all duration-200 z-10 translate-y-1 group-hover/image:translate-y-0">
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleOpenEditModal(item);
                                      }}
                                      className="p-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-brand-600 rounded-full shadow-sm backdrop-blur-md transform scale-90 hover:scale-100 transition-colors"
                                      title="Edit Product"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDeleteConfirm({
                                            isOpen: true,
                                            type: 'product',
                                            id: item.id,
                                            name: item.name
                                        });
                                      }}
                                      className="p-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-red-600 rounded-full shadow-sm backdrop-blur-md transform scale-90 hover:scale-100 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="p-2 flex-1 flex flex-col bg-white dark:bg-slate-800">
                                  <h3 className="font-bold text-slate-800 dark:text-slate-200 leading-tight text-sm mb-1 truncate" title={item.name}>
                                      {item.name}
                                  </h3>
                                  
                                  <button 
                                    onClick={() => onAddToCart(item)}
                                    className="w-full mt-auto bg-slate-50 dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold py-1 px-2 rounded border border-slate-200 dark:border-slate-600 hover:border-brand-200 dark:hover:border-brand-800 transition-colors flex items-center justify-center gap-1 text-xs active:scale-95"
                                  >
                                    <Plus size={12} />
                                    Add
                                  </button>
                                </div>
                             </div>
                          ))}
                       </React.Fragment>
                     );
                   })}
                </div>
              ) : (
                /* --- LIST VIEW (Table) --- */
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-600">
                          <th className="p-3 font-bold text-xs">Product</th>
                          <th className="p-3 font-bold text-xs">Category</th>
                          <th className="p-3 font-bold text-xs">Price</th>
                          <th className="p-3 font-bold text-xs text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredItems.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                            <td className="p-3 flex items-center gap-3">
                               <div 
                                 className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-600 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600 cursor-pointer group/image relative"
                                 onClick={() => triggerImageReplacement(item.id)}
                                 title="Click to replace image"
                               >
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity">
                                    <Upload size={12} className="text-white" />
                                  </div>
                               </div>
                               <span className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</span>
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-300 text-xs font-medium">
                               <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                 {item.category}
                               </span>
                            </td>
                            <td className="p-3 font-bold text-slate-800 dark:text-white text-sm">
                               <div 
                                  className="cursor-pointer hover:text-brand-600 flex items-center gap-1"
                                  onClick={(e) => startPriceEdit(e, item)}
                                  title="Click to edit"
                               >
                                  {quickEditingPriceId === item.id ? (
                                    <input 
                                      type="number" 
                                      value={tempPrice}
                                      onChange={(e) => setTempPrice(e.target.value)}
                                      onBlur={() => savePriceEdit(item)}
                                      onKeyDown={(e) => handlePriceKeyDown(e, item)}
                                      className="w-16 px-1 py-0.5 text-slate-900 text-xs rounded border border-brand-300 focus:outline-none"
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <>
                                      ₱{item.price.toFixed(2)}
                                      <Edit2 size={10} className="text-slate-300 opacity-0 group-hover:opacity-100" />
                                    </>
                                  )}
                               </div>
                            </td>
                            <td className="p-3 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button 
                                     onClick={() => onAddToCart(item)}
                                     className="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-bold text-xs px-2 py-1 rounded hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors flex items-center gap-1"
                                     title="Add to Cart"
                                  >
                                     <ShoppingCart size={14} /> Add
                                  </button>
                                  <span className="h-4 w-px bg-slate-200 dark:bg-slate-600 mx-1"></span>
                                  <button 
                                     onClick={() => handleOpenEditModal(item)}
                                     className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-bold text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                                  >
                                     <Edit2 size={14} /> Edit
                                  </button>
                                  <button 
                                     onClick={() => setDeleteConfirm({
                                        isOpen: true,
                                        type: 'product',
                                        id: item.id,
                                        name: item.name
                                     })}
                                     className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-bold text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
                                  >
                                     <Trash2 size={14} /> Delete
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );

  const renderSalesTab = () => (
    <div className="p-6 h-full overflow-y-auto bg-white dark:bg-slate-900">
       {/* Metrics Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Sales</p>
                <h3 className="text-2xl font-bold text-brand-600 dark:text-brand-400">₱{dailySales.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-1">{dailyOrderCount} transactions</p>
             </div>
             <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-full text-brand-600 dark:text-brand-400">
                <TrendingUp size={24} />
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Monthly Sales</p>
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₱{monthlySales.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleString('default', { month: 'long' })}</p>
             </div>
             <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full text-indigo-600 dark:text-indigo-400">
                <CalendarDays size={24} />
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
             <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Lifetime Sales</p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₱{totalSales.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-1">{totalOrders} total orders</p>
             </div>
             <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full text-emerald-600 dark:text-emerald-400">
                <DollarSign size={24} />
             </div>
          </div>
       </div>

       {/* Daily Summary Table */}
       <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                <Clock size={16} /> Today's Transactions
             </h3>
             <button 
                onClick={() => handleExportCSV(dailyOrders, 'daily_sales')}
                className="text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 text-xs font-medium"
                disabled={dailyOrders.length === 0}
             >
                <Download size={14} /> Export
             </button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
                   <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                   {dailyOrders.length === 0 ? (
                      <tr>
                         <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                            No transactions yet today.
                         </td>
                      </tr>
                   ) : (
                      dailyOrders.map(order => (
                         <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs font-medium">
                               {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-4 py-3 text-slate-800 dark:text-white text-xs font-bold">
                               {order.customerName || 'Guest'}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                               {order.items.length} items
                            </td>
                            <td className="px-4 py-3 text-right text-slate-800 dark:text-white text-xs font-bold">
                               ₱{order.total.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right">
                               {currentUserRole === 'admin' ? (
                                 <button 
                                    onClick={() => setOrderDeleteConfirm({
                                      isOpen: true,
                                      id: order.id,
                                      name: order.customerName ? `${order.customerName} (Order #${order.id.slice(-4)})` : `Order #${order.id}`
                                    })}
                                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded transition-colors"
                                    title="Delete Record"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                               ) : (
                                 <span title="Admin only" className="inline-block">
                                    <Lock size={14} className="text-slate-300 dark:text-slate-600" />
                                 </span>
                               )}
                            </td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="p-6 h-full overflow-y-auto bg-white dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
         <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Transaction History</h3>
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                   {orders.length}
                </span>
             </div>
             <button 
                onClick={() => handleExportCSV(orders, 'sales_history')}
                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
             >
                <Download size={14} /> Export CSV
             </button>
         </div>
         
         <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
               <tr>
                  <th className="px-4 py-3">Items (Products)</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
               {orders.length === 0 ? (
                  <tr>
                     <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">
                        No history available.
                     </td>
                  </tr>
               ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                       <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300">
                          <div className="flex flex-col gap-1 max-w-xs">
                            {order.items.map((item, idx) => (
                                <span key={idx} className="truncate">
                                    <span className="font-bold text-slate-900 dark:text-white">{item.quantity}x</span> {item.name}
                                </span>
                            ))}
                          </div>
                       </td>
                       <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-white">
                          {order.customerName || 'Unknown'}
                       </td>
                       <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                          <div>{new Date(order.date).toLocaleDateString()}</div>
                          <div className="text-[10px] opacity-70">{new Date(order.date).toLocaleTimeString()}</div>
                       </td>
                       <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-white text-xs whitespace-nowrap">
                          ₱{order.total.toFixed(2)}
                       </td>
                       <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                               onClick={() => setEditConfirm(order)}
                               className="flex items-center gap-1 text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 text-xs font-bold px-2 py-1 rounded hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                               title="Restore to Cart"
                            >
                               <RotateCcw size={14} /> Restore
                            </button>
                            {currentUserRole === 'admin' ? (
                              <button 
                                 onClick={() => setOrderDeleteConfirm({
                                   isOpen: true,
                                   id: order.id,
                                   name: order.customerName ? `${order.customerName} (Order #${order.id.slice(-4)})` : `Order #${order.id}`
                                 })}
                                 className="flex items-center gap-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                 title="Delete Record"
                              >
                                 <Trash2 size={14} /> Delete
                              </button>
                            ) : (
                              <span title="Admin only" className="ml-2 inline-flex items-center">
                                <Lock size={14} className="text-slate-300 dark:text-slate-600" />
                              </span>
                            )}
                          </div>
                       </td>
                    </tr>
                  ))
               )}
            </tbody>
         </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full relative bg-white dark:bg-slate-900 transition-colors duration-300">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleDirectImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* --- Tab Navigation --- */}
      <div className="flex items-center px-4 pt-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0 gap-1 overflow-x-auto">
         <button
            onClick={() => onTabChange('products')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
               activeTab === 'products' 
               ? 'border-brand-600 text-brand-600 dark:text-brand-400' 
               : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'
            }`}
         >
            <Package size={16} />
            Products
         </button>
         
         {currentUserRole === 'admin' && (
            <>
               <button
                  onClick={() => onTabChange('sales')}
                  className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                     activeTab === 'sales' 
                     ? 'border-brand-600 text-brand-600 dark:text-brand-400' 
                     : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'
                  }`}
               >
                  <BarChart3 size={16} />
                  Sales Report
               </button>
               <button
                  onClick={() => onTabChange('history')}
                  className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                     activeTab === 'history' 
                     ? 'border-brand-600 text-brand-600 dark:text-brand-400' 
                     : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300'
                  }`}
               >
                  <History size={16} />
                  Transactions
               </button>
            </>
         )}
      </div>

      <div className="flex-1 overflow-hidden relative">
          {activeTab === 'products' && renderProductTab()}
          
          {activeTab === 'sales' && (
             currentUserRole === 'admin' 
               ? renderSalesTab() 
               : <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Lock size={48} className="mb-4 opacity-20" />
                    <p>Admin Access Required</p>
                 </div>
          )}
          
          {activeTab === 'history' && (
             currentUserRole === 'admin' 
               ? renderHistoryTab() 
               : <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Lock size={48} className="mb-4 opacity-20" />
                    <p>Admin Access Required</p>
                 </div>
          )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90%]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingItem ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                 <input 
                   required
                   type="text" 
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                   placeholder="e.g. Cheeseburger"
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price (₱)</label>
                   <input 
                     required
                     type="number" 
                     step="0.01"
                     min="0"
                     value={formData.price}
                     onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                     className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                     placeholder="0.00"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                   <div className="flex gap-2">
                       <input 
                          required
                          list="category-options"
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                          placeholder="Select or type..."
                       />
                       {categories.includes(formData.category || '') && (
                            <button
                                type="button"
                                onClick={() => setDeleteConfirm({
                                    isOpen: true,
                                    type: 'category',
                                    id: formData.category || '',
                                    name: formData.category || ''
                                })}
                                className="bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 p-2.5 rounded-lg transition-colors shrink-0"
                                title="Delete Category"
                            >
                                <Trash2 size={18} />
                            </button>
                       )}
                   </div>
                   <datalist id="category-options">
                      {categories.map(c => <option key={c} value={c} />)}
                   </datalist>
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Image</label>
                 <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {formData.imageUrl ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-bold">
                           Click to replace image
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <Upload size={24} className="mb-2" />
                        <span className="text-xs">Click to upload image</span>
                      </div>
                    )}
                 </div>
               </div>
            </form>
            <div className="p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
              {editingItem && (
                 <button 
                   type="button"
                   onClick={() => {
                      if (editingItem) {
                         setDeleteConfirm({
                           isOpen: true,
                           type: 'product',
                           id: editingItem.id,
                           name: editingItem.name
                         });
                      }
                   }}
                   className="flex-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                 >
                   <Trash2 size={18} /> Delete
                 </button>
              )}
              <button 
                onClick={handleSaveProduct}
                className="flex-[2] bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} /> Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Delete Product/Category Confirmation Modal */}
      {deleteConfirm && deleteConfirm.isOpen && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xs animate-in fade-in zoom-in duration-200 p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-3">
                    <Trash2 size={24} />
                 </div>
                 <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
                   Delete {deleteConfirm.type === 'category' ? 'Category' : 'Product'}?
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Are you sure you want to delete <br/>
                    <span className="font-bold text-slate-900 dark:text-slate-200">"{deleteConfirm.name}"</span>?
                    {deleteConfirm.type === 'category' && (
                       <span className="block mt-2 text-red-500 text-xs font-bold">
                          Warning: This will also delete all products in this category!
                       </span>
                    )}
                 </p>
                 <div className="flex gap-3 w-full">
                    <button 
                       onClick={() => setDeleteConfirm(null)}
                       className="flex-1 py-2.5 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                       No
                    </button>
                    <button 
                       onClick={() => {
                          if (deleteConfirm.type === 'category') {
                             onDeleteCategory(deleteConfirm.id);
                          } else {
                             onDelete(deleteConfirm.id);
                          }
                          setDeleteConfirm(null);
                          setIsModalOpen(false); // Close edit modal if open
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

      {/* 3. Delete Order Confirmation Modal */}
      {orderDeleteConfirm && orderDeleteConfirm.isOpen && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xs animate-in fade-in zoom-in duration-200 p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-3">
                    <Trash2 size={24} />
                 </div>
                 <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
                   Delete Order?
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Are you sure you want to delete <br/>
                    <span className="font-bold text-slate-900 dark:text-slate-200">"{orderDeleteConfirm.name}"</span>?
                 </p>
                 <div className="flex gap-3 w-full">
                    <button 
                       onClick={() => setOrderDeleteConfirm(null)}
                       className="flex-1 py-2.5 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                       No
                    </button>
                    <button 
                       onClick={() => {
                          onDeleteOrder(orderDeleteConfirm.id);
                          setOrderDeleteConfirm(null);
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

      {/* 4. Restore/Edit Order Confirmation Modal */}
      {editConfirm && (
         <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xs animate-in fade-in zoom-in duration-200 p-5 border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col items-center text-center">
                   <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                      <RotateCcw size={24} />
                   </div>
                   <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
                     Restore Order?
                   </h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                      This will replace the current cart and update the customer name to <br/>
                      <span className="font-bold text-slate-900 dark:text-slate-200">
                        "{editConfirm.customerName || `Order #${editConfirm.id.slice(-4)}`}"
                      </span>.
                   </p>
                   <div className="flex gap-3 w-full">
                      <button 
                         onClick={() => setEditConfirm(null)}
                         className="flex-1 py-2.5 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                         No
                      </button>
                      <button 
                         onClick={() => {
                            onRestoreOrder(editConfirm);
                            setEditConfirm(null);
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
