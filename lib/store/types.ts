import type { Category, Order, OrderStatus, Product, Settings, Stats, User } from '../types';

/**
 * ডাটা-স্টোর ইন্টারফেস।
 * দুটি ইমপ্লিমেন্টেশন আছে:
 *   - memory  : ডিফল্ট, কোনো env লাগে না (ডেমো/স্টার্টার মোড)
 *   - postgres: DATABASE_URL / POSTGRES_URL দিলে স্বয়ংক্রিয়ভাবে চালু হয়
 */
export interface DataStore {
  kind: 'memory' | 'postgres';
  init(): Promise<void>;

  getSettings(): Promise<Settings>;
  updateSettings(patch: Partial<Settings>): Promise<Settings>;

  findUserByEmail(email: string): Promise<User | null>;
  findUserByPhone(phone: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  createUser(input: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  updateUserPassword(id: string, passwordHash: string): Promise<void>;
  countUsers(): Promise<number>;

  listCategories(): Promise<Category[]>;
  listProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(input: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  updateProduct(id: string, patch: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<void>;

  createOrder(input: Omit<Order, 'id' | 'createdAt'>): Promise<Order>;
  getOrderById(id: string): Promise<Order | null>;
  listOrders(): Promise<Order[]>;
  listOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null>;

  getStats(): Promise<Stats>;
}
