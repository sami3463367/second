import type { CartItem, Product, Settings } from './types';

/** ছোট classname জয়েনার */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** বাংলা টেক্সট থেকে URL-safe slug তৈরি; বাংলা অক্ষর অক্ষুণ্ণ থাকে, স্পেস -> ড্যাশ */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // \p{L} অক্ষর, \p{M} মাত্রা/কার-চিহ্ন, \p{N} সংখ্যা — বাংলা সঠিক রাখতে সবগুলো রাখা হয়
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

let counter = 0;
/** ইউনিক আইডি জেনারেটর */
export function uid(prefix = 'id'): string {
  counter += 1;
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${rand}`;
}

/** অর্ডার আইডি — e.g. GB-104523 */
export function orderId(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `GB-${n}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export interface CartTotals {
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  itemCount: number;
  freeDelivery: boolean;
  remainingForFree: number;
}

/** কার্ট ও অর্ডারের হিসাব — এক জায়গায় যাতে স্টোরফ্রন্ট ও অ্যাডমিন একই রকম দেখায় */
export function calcTotals(items: CartItem[], settings: Settings, district?: string): CartTotals {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const itemCount = items.reduce((sum, it) => sum + it.qty, 0);
  const freeDelivery = settings.freeDeliveryOver > 0 && subtotal >= settings.freeDeliveryOver;
  const insideDhaka = !district || district === 'ঢাকা';
  const base = insideDhaka ? settings.deliveryCharge : settings.deliveryChargeOutside;
  const deliveryCharge = items.length === 0 ? 0 : freeDelivery ? 0 : base;
  const discount = 0;
  const total = subtotal + deliveryCharge - discount;
  const remainingForFree = Math.max(0, settings.freeDeliveryOver - subtotal);
  return { subtotal, deliveryCharge, discount, total, itemCount, freeDelivery, remainingForFree };
}

/** ফোন নম্বর ভ্যালিডেশন — BD ফরম্যাট */
export function isValidBdPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(cleaned);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** wa.me লিংকের জন্য নম্বর নর্মালাইজ — +, স্পেস, ড্যাশ বাদ */
export function normalizePhoneForWa(number: string): string {
  return number.replace(/[^\d]/g, '');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** ছাড়ের শতাংশ — e.g. oldPrice 4500, price 3490 => 22 */
export function discountPercent(p: Pick<Product, 'price' | 'oldPrice'>): number {
  if (!p.oldPrice || p.oldPrice <= p.price) return 0;
  return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
}
