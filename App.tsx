
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, LayoutGrid, Settings, History, Wallet, 
  Maximize, Minimize, LogOut, Users as UsersIcon, Search, UtensilsCrossed 
} from 'lucide-react';
import { 
  MenuItem, Order, Customer, AppSettings, Expense, User 
} from './types';
import { MenuCard } from './components/MenuCard';
import { Cart } from './components/Cart';
import { PaymentModal } from './components/PaymentModal';
import { CustomerSidebar } from './components/CustomerSidebar';
import { ProductManagement } from './components/ProductManagement';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ExpensesModal } from './components/ExpensesModal';
import { LoginScreen } from './components/LoginScreen';
import { UserManagementModal } from './components/UserManagementModal';
import { SnowEffect } from './components/SnowEffect';
import { 
  getStoredOrders, saveOrderToStorage, saveOrdersToStorage, deleteOrderFromStorage,
  getStoredProducts, saveProductsToStorage,
  getStoredCategories, saveCategoriesToStorage,
  getStoredSettings, saveSettingsToStorage,
  getStoredExpenses, saveExpensesToStorage,
  getStoredUsers, saveUsersToStorage,
  getStoredCustomers, saveCustomersToStorage,
  exportAllData
} from './services/storageService';
import { MOCK_CUSTOMERS } from './constants';

// Seed Data for fresh start
const DEFAULT_MENU_ITEMS: MenuItem[] = [];
const DEFAULT_CATEGORIES: string[] = [];

const App: React.FC = () => {
  // --- State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
     appName: 'BistroGenius', appLogo: 'default', themeMode: 'light', isSnowing: false
  });
  const [users, setUsers] = useState<User[]>([]);

  // UI State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pos' | 'management'>('pos');
  const [managementTab, setManagementTab] = useState<'products' | 'sales' | 'history'>('products');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpensesOpen, setIsExpensesOpen] = useState(false);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    setItems(getStoredProducts(DEFAULT_MENU_ITEMS));
    setCategories(getStoredCategories(DEFAULT_CATEGORIES));
    setOrders(getStoredOrders());
    setCustomers(getStoredCustomers(MOCK_CUSTOMERS));
    setExpenses(getStoredExpenses());
    const storedSettings = getStoredSettings();
    setSettings(storedSettings); // Load settings
    setUsers(getStoredUsers());
  }, []);

  // --- Theme Effect ---
  useEffect(() => {
    if (settings.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.themeMode]);

  // --- Fullscreen Toggle ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen change events (e.g. user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleLogout = () => {
    // Auto-backup on logout
    // This will download a JSON file to the browser's default download location (e.g., C:\Downloads)
    try {
        exportAllData('AutoBackup');
    } catch (e) {
        console.error("Auto-backup failed", e);
    }
    setCurrentUser(null);
  };

  // --- Computed ---
  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId) || null,
  [customers, selectedCustomerId]);

  const currentCart = selectedCustomer?.cart || [];
  
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // --- Actions ---

  // Customers
  const handleSelectCustomer = (customer: Customer) => setSelectedCustomerId(customer.id);
  
  const handleAddCustomer = () => {
    // Generate a unique name for a new customer "Customer X"
    let nextNum = 1;
    // We want to avoid duplicates among *active* customers in the sidebar.
    // It's okay if a past order has "Customer 1" and we make a new "Customer 1".
    const activeNames = new Set(customers.map(c => c.name));
    while (activeNames.has(`Customer ${nextNum}`)) {
      nextNum++;
    }

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: `Customer ${nextNum}`,
      email: '',
      phone: '',
      visits: 1,
      lastVisit: new Date().toISOString(),
      loyaltyPoints: 0,
      cart: [],
      discountType: 'fixed',
      discountValue: 0,
      editingOrderId: undefined // Explicitly undefined for new customer
    };
    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    saveCustomersToStorage(updated);
    setSelectedCustomerId(newCustomer.id);
  };

  const handleUpdateCustomer = (id: string, updates: Partial<Customer>) => {
    const updated = customers.map(c => c.id === id ? { ...c, ...updates } : c);
    setCustomers(updated);
    saveCustomersToStorage(updated);
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveCustomersToStorage(updated);
    if (selectedCustomerId === id) setSelectedCustomerId(null);
  };

  // Cart
  const handleAddToCart = (item: MenuItem) => {
    if (!selectedCustomerId) {
       if (customers.length === 0) {
         handleAddCustomer();
         // Wait for state update or create customer inline if needed, but simple return here for safety
         return; 
       }
       alert("Please select a customer first.");
       return;
    }
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const existingItem = customer.cart.find(i => i.id === item.id);
    let newCart;
    if (existingItem) {
      newCart = customer.cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      newCart = [...customer.cart, { ...item, quantity: 1 }];
    }
    handleUpdateCustomer(customer.id, { cart: newCart });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    if (!selectedCustomer) return;
    const newCart = selectedCustomer.cart.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0);
    handleUpdateCustomer(selectedCustomer.id, { cart: newCart });
  };

  const handleRemoveFromCart = (itemId: string) => {
    if (!selectedCustomer) return;
    const newCart = selectedCustomer.cart.filter(item => item.id !== itemId);
    handleUpdateCustomer(selectedCustomer.id, { cart: newCart });
  };

  const handleClearCart = () => {
    if (!selectedCustomer) return;
    // Clearing cart also cancels edit mode if active
    handleUpdateCustomer(selectedCustomer.id, { cart: [], discountValue: 0, editingOrderId: undefined });
  };

  const handleDiscountChange = (val: number) => {
    if (!selectedCustomer) return;
    handleUpdateCustomer(selectedCustomer.id, { discountValue: val });
  };

  const handleDiscountTypeChange = (type: 'percent' | 'fixed') => {
    if (!selectedCustomer) return;
    handleUpdateCustomer(selectedCustomer.id, { discountType: type });
  };

  // Checkout
  const handleCheckout = () => {
    if (!selectedCustomer || selectedCustomer.cart.length === 0) return;
    setIsPaymentOpen(true);
  };

  const handlePaymentConfirmed = () => {
    if (!selectedCustomer) return;
    
    // Calculate totals with correct discount logic
    const subtotal = selectedCustomer.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    let discount = 0;
    if (selectedCustomer.discountType === 'percent') {
        discount = subtotal * (selectedCustomer.discountValue / 100);
    } else {
        discount = selectedCustomer.discountValue;
    }
    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);
    
    const total = subtotal - discount;

    let updatedOrders: Order[];

    if (selectedCustomer.editingOrderId) {
        // --- EDIT MODE: Update Existing Order ---
        updatedOrders = orders.map(order => {
            if (order.id === selectedCustomer.editingOrderId) {
                return {
                    ...order,
                    items: [...selectedCustomer.cart],
                    total,
                    subtotal,
                    discount,
                    discountType: selectedCustomer.discountType,
                    discountValue: selectedCustomer.discountValue,
                    customerName: selectedCustomer.name,
                    date: new Date().toISOString() // Update timestamp to reflect edit time
                };
            }
            return order;
        });
        setOrders(updatedOrders);
        saveOrdersToStorage(updatedOrders);
    } else {
        // --- NEW ORDER MODE ---
        const newOrder: Order = {
          id: Date.now().toString(),
          items: [...selectedCustomer.cart],
          total,
          subtotal,
          tax: 0, // Simplified
          date: new Date().toISOString(),
          customerName: selectedCustomer.name,
          discount,
          discountType: selectedCustomer.discountType,
          discountValue: selectedCustomer.discountValue
        };
        updatedOrders = saveOrderToStorage(newOrder);
        setOrders(updatedOrders);
    }

    // Update Customer (points, clear cart)
    const newPoints = selectedCustomer.loyaltyPoints + Math.floor(total / 100);
    
    // Instead of deleting the customer, we just clear their cart and update points.
    // Also CLEAR editingOrderId so next order is new.
    const updatedCustomers = customers.filter(c => c.id !== selectedCustomer.id);
    setCustomers(updatedCustomers);
    saveCustomersToStorage(updatedCustomers);
    setSelectedCustomerId(null);
  };

  // Helper to add category safely
  const ensureCategoryExists = (cat: string) => {
    if (!cat) return;
    const trimmed = cat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      saveCategoriesToStorage(updated);
    }
  };

  // Product Management
  const handleAddProduct = (item: MenuItem) => {
    const updated = [item, ...items];
    setItems(updated);
    saveProductsToStorage(updated);
    ensureCategoryExists(item.category);
  };
  
  const handleUpdateProduct = (item: MenuItem) => {
    const updated = items.map(i => i.id === item.id ? item : i);
    setItems(updated);
    saveProductsToStorage(updated);
    ensureCategoryExists(item.category);
  };
  
  const handleDeleteProduct = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    saveProductsToStorage(updated);
  };
  const handleAddCategory = (cat: string) => {
    if (!cat) return;
    const trimmed = cat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const updated = [...categories, trimmed];
      setCategories(updated);
      saveCategoriesToStorage(updated);
    }
  };
  const handleDeleteCategory = (cat: string) => {
    const updatedCats = categories.filter(c => c !== cat);
    setCategories(updatedCats);
    saveCategoriesToStorage(updatedCats);
    // Recursively delete products in this category
    const updatedItems = items.filter(i => i.category !== cat);
    setItems(updatedItems);
    saveProductsToStorage(updatedItems);
    if (selectedCategory === cat) setSelectedCategory('All');
  };

  // Order Management
  const handleDeleteOrder = (id: string) => {
    const updated = deleteOrderFromStorage(id);
    setOrders(updated);
  };

  // Restore order to cart (overwrite current customer cart)
  const handleRestoreOrder = (order: Order) => {
    let currentCustomers = [...customers];
    let targetId = selectedCustomerId;

    // If no customer is currently selected, create one to hold the restored order
    if (!targetId) {
      let nextNum = 1;
      const activeNames = new Set(currentCustomers.map(c => c.name));
      while (activeNames.has(`Customer ${nextNum}`)) {
        nextNum++;
      }
      
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: `Customer ${nextNum}`, // Placeholder, will be overwritten below
        email: '',
        phone: '',
        visits: 1,
        lastVisit: new Date().toISOString(),
        loyaltyPoints: 0,
        cart: [],
        discountType: 'fixed',
        discountValue: 0
      };
      
      currentCustomers = [newCustomer, ...currentCustomers];
      targetId = newCustomer.id;
      setSelectedCustomerId(targetId);
    }

    // Update the target customer with restored order data (Cart & Name)
    const updatedCustomers = currentCustomers.map(c => {
      if (c.id === targetId) {
        return {
          ...c,
          cart: order.items.map(i => ({...i})), // Deep copy items
          discountValue: order.discountValue || 0,
          discountType: order.discountType || 'fixed',
          // Force overwrite customer name with order name
          name: order.customerName && order.customerName !== 'Guest' ? order.customerName : c.name,
          editingOrderId: order.id // TRACK THE ID TO ENABLE EDIT MODE
        };
      }
      return c;
    });

    setCustomers(updatedCustomers);
    saveCustomersToStorage(updatedCustomers);
    
    setActiveTab('pos');
    setIsHistoryOpen(false);
  };

  // Expenses
  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExp = { ...expense, id: Date.now().toString() };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveExpensesToStorage(updated);
  };
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveExpensesToStorage(updated);
  };

  // Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
  };

  // Users
  const handleAddUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Date.now().toString() };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsersToStorage(updated);
  };
  const handleDeleteUser = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveUsersToStorage(updated);
  };
  
  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
    setUsers(updated);
    saveUsersToStorage(updated);
  };

  // --- RENDER BLOCKERS ---

  // Render Login
  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} settings={settings} />;
  }
  
  // Calculate totals for payment modal
  const cartSubtotal = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate Discount Amount based on Type
  let cartDiscountAmount = 0;
  if (selectedCustomer) {
      if (selectedCustomer.discountType === 'percent') {
          cartDiscountAmount = cartSubtotal * (selectedCustomer.discountValue / 100);
      } else {
          cartDiscountAmount = selectedCustomer.discountValue;
      }
      cartDiscountAmount = Math.min(cartDiscountAmount, cartSubtotal);
  }
  
  const cartTotal = cartSubtotal - cartDiscountAmount;

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300 print:h-auto print:overflow-visible">
      {settings.isSnowing && <SnowEffect />}
      
      {/* Floating Exit Fullscreen Button */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-[9999] p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-all shadow-lg border border-white/10"
          title="Exit Fullscreen"
        >
          <Minimize size={20} />
        </button>
      )}

      {/* 1. Sidebar (Customers) */}
      <div className="w-64 h-full flex-shrink-0 shadow-xl z-20 print:hidden">
        <CustomerSidebar 
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={handleSelectCustomer}
          onAddCustomer={handleAddCustomer}
          onUpdateCustomer={handleUpdateCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          settings={settings}
          isFullscreen={isFullscreen}
        />
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900/50 relative">
        
        {/* Header - Hidden in Fullscreen */}
        {!isFullscreen && (
          <header className="h-[60px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shrink-0 transition-colors duration-300 print:hidden">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('pos')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'pos' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                <Menu size={18} /> POS
              </button>
              <button 
                onClick={() => { setActiveTab('management'); setManagementTab('products'); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'management' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                <LayoutGrid size={18} /> Management
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setIsExpensesOpen(true)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Expenses">
                  <Wallet size={20} />
              </button>
              <button onClick={() => setIsHistoryOpen(true)} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="History">
                  <History size={20} />
              </button>
              {currentUser.role === 'admin' && (
                  <>
                    <button onClick={() => setIsUserMgmtOpen(true)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Users">
                        <UsersIcon size={20} />
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" title="Settings">
                        <Settings size={20} />
                    </button>
                  </>
              )}
              
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1"></div>

              <button 
                onClick={toggleFullscreen}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Enter Fullscreen"
              >
                  <Maximize size={20} />
              </button>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors ml-1"
                title="Logout (Auto-Backup)"
              >
                  <LogOut size={20} />
                  <span className="font-medium hidden xl:inline">Logout</span>
              </button>
            </div>
          </header>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden relative print:overflow-visible print:h-auto">
           {activeTab === 'pos' ? (
             <div className="h-full flex flex-col">
                {/* Filters */}
                <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 shrink-0 transition-colors duration-300 print:hidden">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search menu..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none dark:text-white"
                        />
                    </div>
                    <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide">
                       <button
                         onClick={() => setSelectedCategory('All')}
                         className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                       >
                         All Items
                       </button>
                       {categories.map(cat => (
                         <button
                           key={cat}
                           onClick={() => setSelectedCategory(cat)}
                           className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                         >
                           {cat}
                         </button>
                       ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 print:overflow-visible print:h-auto">
                   {filteredItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                         <UtensilsCrossed size={48} className="mb-4 opacity-20" />
                         <p>No items found</p>
                      </div>
                   ) : (
                     <div className="space-y-8 pb-8">
                       {(selectedCategory === 'All' ? categories : [selectedCategory]).map(category => {
                          const categoryItems = filteredItems.filter(item => item.category === category);
                          if (categoryItems.length === 0) return null;
                          
                          return (
                            <div key={category}>
                              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs mb-4 flex items-center gap-2 px-1">
                                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                                {category}
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {categoryItems.map(item => (
                                  <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                                ))}
                              </div>
                            </div>
                          );
                       })}
                       
                       {/* Handle items in "Other" category or unlisted categories when showing All */}
                       {selectedCategory === 'All' && filteredItems.filter(i => !categories.includes(i.category)).length > 0 && (
                          <div key="Other">
                              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs mb-4 flex items-center gap-2 px-1">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                Other
                              </h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredItems.filter(i => !categories.includes(i.category)).map(item => (
                                  <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                                ))}
                              </div>
                          </div>
                       )}
                     </div>
                   )}
                </div>
             </div>
           ) : (
             <ProductManagement 
                items={items}
                categories={categories}
                orders={orders}
                onAdd={handleAddProduct}
                onUpdate={handleUpdateProduct}
                onDelete={handleDeleteProduct}
                onAddToCart={handleAddToCart}
                onDeleteOrder={handleDeleteOrder}
                onEditOrder={handleRestoreOrder}
                onRestoreOrder={handleRestoreOrder}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                activeTab={managementTab}
                onTabChange={setManagementTab}
                currentUserRole={currentUser.role}
             />
           )}
        </div>
      </div>

      {/* 3. Cart Panel (Right) - Only visible in POS mode */}
      {activeTab === 'pos' && (
        <div className="w-[340px] border-l border-slate-200 dark:border-slate-700 shadow-xl z-20 bg-white dark:bg-slate-800 transition-colors duration-300 print:hidden">
           <Cart 
             cartItems={currentCart}
             onUpdateQuantity={handleUpdateQuantity}
             onRemoveItem={handleRemoveFromCart}
             onClearCart={handleClearCart}
             onCheckout={handleCheckout}
             discountValue={selectedCustomer?.discountValue || 0}
             setDiscountValue={handleDiscountChange}
             discountType={selectedCustomer?.discountType || 'fixed'}
             setDiscountType={handleDiscountTypeChange}
             customerName={selectedCustomer?.name || 'Select Customer'}
             isEditing={!!selectedCustomer?.editingOrderId}
             isFullscreen={isFullscreen}
           />
        </div>
      )}

      {/* Modals */}
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={cartTotal}
        subtotal={cartSubtotal}
        discountType={selectedCustomer?.discountType || 'fixed'}
        discountValue={selectedCustomer?.discountValue || 0}
        onUpdateDiscount={(type, value) => {
            if (!selectedCustomer) return;
            handleUpdateCustomer(selectedCustomer.id, { discountType: type, discountValue: value });
        }}
        cartItems={currentCart}
        customerName={selectedCustomer?.name || 'Guest'}
        onConfirmPayment={handlePaymentConfirmed}
        settings={settings}
      />

      <OrderHistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        orders={orders}
        onRestore={handleRestoreOrder}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <ExpensesModal 
        isOpen={isExpensesOpen}
        onClose={() => setIsExpensesOpen(false)}
        expenses={expenses}
        onAdd={handleAddExpense}
        onDelete={handleDeleteExpense}
      />

      <UserManagementModal 
        isOpen={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
        users={users}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onUpdateUser={handleUpdateUser}
        currentUser={currentUser}
      />

    </div>
  );
};

export default App;
