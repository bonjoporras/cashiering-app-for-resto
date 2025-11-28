
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  date: string;
  customerName?: string;
  discount?: number;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface AIReply {
  type: 'suggestion' | 'receipt';
  content: string;
  suggestedItemIds?: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  lastVisit: string;
  loyaltyPoints: number;
  cart: CartItem[];
  discountType: 'percent' | 'fixed';
  discountValue: number;
  aiRecommendation?: { text: string; itemIds: string[] };
  editingOrderId?: string; // ID of the order being edited/restored
}

export interface AppSettings {
  appName: string;
  appLogo: string; // 'default' or URL
  themeMode: 'light' | 'dark';
  isSnowing: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this should be hashed
  role: 'admin' | 'user';
  name: string;
  isDefaultAdmin?: boolean; // True only for the super admin
  isActive?: boolean; // If false, cannot login
  validUntil?: string | null; // ISO Date string. If present, account expires after this date. Null = infinite.
}
