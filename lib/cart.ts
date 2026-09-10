'use client';

import type { CartItem } from './types';

/** লোকালস্টোরেজ-ভিত্তিক কার্ট (ক্লায়েন্ট সাইড) */
const KEY = 'gb_cart_v1';

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) => i && typeof i.productId === 'string' && Number(i.qty) > 0);
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function clearCart(): void {
  writeCart([]);
}
