import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../types/menu';

export interface TrayItem {
  product: Product;
  quantity: number;
}

interface CustomerTrayContextType {
  items: TrayItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearTray: () => void;
  totalItems: number;
  totalPrice: number;
  isTrayOpen: boolean;
  setIsTrayOpen: (open: boolean) => void;
  getItemQuantity: (productId: string) => number;
}

const CustomerTrayContext = createContext<CustomerTrayContextType | undefined>(undefined);

const STORAGE_KEY = 'ritual_customer_tray_items';

export function CustomerTrayProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<TrayItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isTrayOpen, setIsTrayOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving tray items to localStorage', e);
    }
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearTray = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = items.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );

  return (
    <CustomerTrayContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearTray,
        totalItems,
        totalPrice,
        isTrayOpen,
        setIsTrayOpen,
        getItemQuantity,
      }}
    >
      {children}
    </CustomerTrayContext.Provider>
  );
}

export function useCustomerTray() {
  const context = useContext(CustomerTrayContext);
  if (!context) {
    throw new Error('useCustomerTray must be used within a CustomerTrayProvider');
  }
  return context;
}

