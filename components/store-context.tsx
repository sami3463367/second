'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { clearCart, readCart, writeCart } from '@/lib/cart';
import type { CartItem, Product, SafeUser, Settings } from '@/lib/types';
import { calcTotals, type CartTotals } from '@/lib/utils';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextValue {
  settings: Settings;
  cart: CartItem[];
  cartCount: number;
  totals: CartTotals;
  addToCart: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCartAll: () => void;
  inCart: (productId: string) => number;
  user: SafeUser | null;
  refreshUser: () => Promise<void>;
  district: string;
  setDistrict: (d: string) => void;
  toasts: Toast[];
  pushToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: number) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

export function StoreProvider({
  initialSettings,
  children,
}: {
  initialSettings: Settings;
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [district, setDistrictState] = useState<string>('ঢাকা');
  const toastId = useRef(0);
  const hydrated = useRef(false);

  // কার্ট হাইড্রেশন (লোকালস্টোরেজ)
  useEffect(() => {
    setCart(readCart());
    try {
      const saved = window.localStorage.getItem('gb_district');
      if (saved) setDistrict(saved);
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  const setDistrict = useCallback((next: string) => {
    setDistrictState(next);
    try {
      window.localStorage.setItem('gb_district', next);
    } catch {
      /* ignore */
    }
  }, []);

  // কার্ট পরিবর্তন হলে সংরক্ষণ
  useEffect(() => {
    if (hydrated.current) writeCart(cart);
  }, [cart]);

  // সেটিংস ও ইউজার রিফ্রেশ
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setUser(data?.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    fetch('/api/settings/public', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.settings) setSettings(d.settings as Settings);
      })
      .catch(() => undefined);
  }, [refreshUser]);

  const pushToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((t) => [...t, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const addToCart = useCallback(
    (product: Product, qty = 1) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        const max = Math.max(1, product.stock);
        if (existing) {
          const nextQty = Math.min(max, existing.qty + qty);
          return prev.map((i) => (i.productId === product.id ? { ...i, qty: nextQty } : i));
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            qty: Math.min(max, qty),
            stock: product.stock,
          },
        ];
      });
      pushToast(`"${product.name}" কার্টে যোগ হয়েছে 🛒`, 'success');
    },
    [pushToast],
  );

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: Math.max(0, Math.min(i.stock || 99, qty)) } : i))
        .filter((i) => i.qty > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCartAll = useCallback(() => {
    setCart([]);
    clearCart();
  }, []);

  const inCart = useCallback(
    (productId: string) => cart.find((i) => i.productId === productId)?.qty ?? 0,
    [cart],
  );

  const totals = useMemo(() => calcTotals(cart, settings, district), [cart, settings, district]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const value: StoreContextValue = {
    settings,
    cart,
    cartCount,
    totals,
    addToCart,
    setQty,
    removeFromCart,
    clearCartAll,
    inCart,
    user,
    refreshUser,
    district,
    setDistrict,
    toasts,
    pushToast,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}


