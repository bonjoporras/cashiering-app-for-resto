import { MenuItem, Customer } from './types';

export const MENU_ITEMS: MenuItem[] = [];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Customer 1',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    visits: 12,
    lastVisit: '2023-10-24',
    loyaltyPoints: 150,
    cart: [],
    discountType: 'fixed',
    discountValue: 0,
  },
  {
    id: 'c2',
    name: 'Customer 2',
    email: 'jane.smith@example.com',
    phone: '(555) 987-6543',
    visits: 5,
    lastVisit: '2023-10-20',
    loyaltyPoints: 45,
    cart: [],
    discountType: 'fixed',
    discountValue: 0,
  },
  {
    id: 'c3',
    name: 'Customer 3',
    email: 'alice.j@example.com',
    phone: '(555) 456-7890',
    visits: 28,
    lastVisit: '2023-10-25',
    loyaltyPoints: 320,
    cart: [],
    discountType: 'fixed',
    discountValue: 0,
  },
  {
    id: 'c4',
    name: 'Customer 4',
    email: 'bob.w@example.com',
    phone: '(555) 222-3333',
    visits: 1,
    lastVisit: '2023-09-15',
    loyaltyPoints: 10,
    cart: [],
    discountType: 'fixed',
    discountValue: 0,
  },
];