
import { Order, MenuItem, AppSettings, Expense, User, Customer } from '../types';

const ORDERS_KEY = 'bistrogenius_orders';
const PRODUCTS_KEY = 'bistrogenius_products';
const CATEGORIES_KEY = 'bistrogenius_categories';
const SETTINGS_KEY = 'bistrogenius_settings';
const EXPENSES_KEY = 'bistrogenius_expenses';
const USERS_KEY = 'bistrogenius_users';
const CUSTOMERS_KEY = 'bistrogenius_customers';

// --- Orders ---

export const getStoredOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse orders from storage", error);
    return [];
  }
};

/**
 * Saves the entire list of orders to storage. 
 * Use this when updating/editing existing orders or bulk saving.
 */
export const saveOrdersToStorage = (orders: Order[]): Order[] => {
  try {
    // OPTIMIZATION: Ensure images are stripped from all orders before saving
    const leanOrders = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        imageUrl: '' // Remove image data from history to save space
      }))
    }));

    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(leanOrders));
    } catch (e: any) {
      // Handle Quota Exceeded
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn("Storage quota exceeded. Attempting to trim old orders...");
        
        // Auto-maintenance: Keep only the newest 50 orders
        const trimmedOrders = leanOrders.slice(0, 50);
        try {
          localStorage.setItem(ORDERS_KEY, JSON.stringify(trimmedOrders));
          return trimmedOrders;
        } catch (retryError) {
           console.error("Even trimmed orders could not be saved.", retryError);
           alert("Storage is full. Please delete Sales History or Products to save new data.");
           return getStoredOrders(); // Return previous state on fatal failure
        }
      } else {
        throw e;
      }
    }
    return leanOrders;
  } catch (error) {
    console.error("Failed to save orders to storage", error);
    return getStoredOrders();
  }
};

/**
 * Convenience method to append a single new order.
 */
export const saveOrderToStorage = (order: Order): Order[] => {
  const orders = getStoredOrders();
  const newOrders = [order, ...orders];
  return saveOrdersToStorage(newOrders);
};

export const deleteOrderFromStorage = (orderId: string): Order[] => {
  try {
    const orders = getStoredOrders();
    const newOrders = orders.filter(order => order.id !== orderId);
    return saveOrdersToStorage(newOrders);
  } catch (error) {
    console.error("Failed to delete order from storage", error);
    return [];
  }
};

// --- Products ---

export const getStoredProducts = (defaultItems: MenuItem[]): MenuItem[] => {
  try {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : defaultItems;
  } catch (error) {
    console.error("Failed to parse products from storage", error);
    return defaultItems;
  }
};

export const saveProductsToStorage = (items: MenuItem[]) => {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(items));
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
       alert("Storage full! Cannot save new product. Please delete old products or Sales History to make space.");
    }
    console.error("Failed to save products to storage", error);
  }
};

// --- Categories ---

export const getStoredCategories = (defaultCategories: string[]): string[] => {
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : defaultCategories;
  } catch (error) {
    console.error("Failed to parse categories from storage", error);
    return defaultCategories;
  }
};

export const saveCategoriesToStorage = (categories: string[]) => {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error("Failed to save categories to storage", error);
  }
};

// --- Expenses ---

export const getStoredExpenses = (): Expense[] => {
  try {
    const stored = localStorage.getItem(EXPENSES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse expenses", error);
    return [];
  }
};

export const saveExpensesToStorage = (expenses: Expense[]) => {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error("Failed to save expenses", error);
  }
};

// --- Settings ---

const DEFAULT_SETTINGS: AppSettings = {
  appName: 'BistroGenius',
  appLogo: 'default',
  themeMode: 'light',
  isSnowing: false,
};

export const getStoredSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    return settings;
  } catch (error) {
    console.error("Failed to parse settings", error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettingsToStorage = (settings: AppSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings", error);
  }
};

// --- Users ---

export const getStoredUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Seed default admin if no users exist
    const defaultAdmin: User = {
      id: 'admin1',
      username: 'admin',
      password: '020890', // Default password
      role: 'admin',
      name: 'Administrator',
      isDefaultAdmin: true,
      isActive: true,
      validUntil: null // Infinite
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  } catch (error) {
    console.error("Failed to parse users", error);
    return [];
  }
};

export const saveUsersToStorage = (users: User[]) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users", error);
  }
};

// --- Customers ---

export const getStoredCustomers = (defaultCustomers: Customer[]): Customer[] => {
  try {
    const stored = localStorage.getItem(CUSTOMERS_KEY);
    return stored ? JSON.parse(stored) : defaultCustomers;
  } catch (error) {
    console.error("Failed to parse customers", error);
    return defaultCustomers;
  }
};

export const saveCustomersToStorage = (customers: Customer[]) => {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch (error) {
    console.error("Failed to save customers", error);
  }
};

// --- DATABASE BACKUP & RESTORE ---

interface DatabaseBackup {
  version: number;
  timestamp: string;
  data: {
    orders: Order[];
    products: MenuItem[];
    categories: string[];
    settings: AppSettings;
    expenses: Expense[];
    users: User[];
    customers: Customer[];
  };
}

export const exportAllData = (prefix: string = "Database") => {
  const backup: DatabaseBackup = {
    version: 1,
    timestamp: new Date().toISOString(),
    data: {
      orders: getStoredOrders(),
      products: getStoredProducts([]),
      categories: getStoredCategories([]),
      settings: getStoredSettings(),
      expenses: getStoredExpenses(),
      users: getStoredUsers(),
      customers: getStoredCustomers([])
    }
  };

  const dataStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Format Date and Time for Filename (safe for Windows filenames)
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const timeStr = now.toLocaleTimeString('en-GB').replace(/:/g, '-'); // HH-MM-SS

  const a = document.createElement('a');
  a.href = url;
  // Format: BistroGenius_AutoBackup_2023-10-27_14-30-00.json
  a.download = `BistroGenius_${prefix}_${dateStr}_${timeStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importAllData = async (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const backup: DatabaseBackup = JSON.parse(json);

        // Basic validation
        if (!backup.data || !backup.version) {
          throw new Error("Invalid backup file format");
        }

        // Restore Data
        localStorage.setItem(ORDERS_KEY, JSON.stringify(backup.data.orders || []));
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(backup.data.products || []));
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(backup.data.categories || []));
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(backup.data.settings || DEFAULT_SETTINGS));
        localStorage.setItem(EXPENSES_KEY, JSON.stringify(backup.data.expenses || []));
        localStorage.setItem(USERS_KEY, JSON.stringify(backup.data.users || []));
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(backup.data.customers || []));

        resolve(true);
      } catch (error) {
        console.error("Import failed", error);
        resolve(false);
      }
    };
    reader.readAsText(file);
  });
};

export const factoryReset = () => {
  localStorage.clear();
  window.location.reload();
};
