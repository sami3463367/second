/** ডোমেইন টাইপ ডেফিনিশন — সম্পূর্ণ অ্যাপ জুড়ে ব্যবহৃত */

export type Role = 'admin' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

/** পাবলিকলি নিরাপদ ইউজার ভিউ (পাসওয়ার্ড হ্যাশ বাদে) */
export type SafeUser = Omit<User, 'passwordHash'>;

export interface Category {
  slug: string;
  name: string;
  icon: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string; // category slug
  price: number;
  oldPrice: number | null;
  image: string;
  shortDescription: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  stock: number;
  rating: number;
  reviewCount: number;
  badge: string | null;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  stock: number;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'অপেক্ষমাণ',
  confirmed: 'নিশ্চিত হয়েছে',
  shipped: 'পাঠানো হয়েছে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল',
};

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  area: string;
  note: string;
}

export interface Order {
  id: string;
  userId: string | null;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: 'cod';
  status: OrderStatus;
  whatsappSent: boolean;
  createdAt: string;
}

export interface Settings {
  storeName: string;
  tagline: string;
  announcement: string;
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  deliveryCharge: number;
  deliveryChargeOutside: number;
  freeDeliveryOver: number;
  facebookUrl: string;
  youtubeUrl: string;
}

export interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStock: number;
  recentOrders: Order[];
  ordersByStatus: Record<OrderStatus, number>;
}

export function toSafeUser(u: User): SafeUser {
  const { passwordHash, ...rest } = u;
  void passwordHash;
  return rest;
}
