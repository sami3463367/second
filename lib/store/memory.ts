import { DEFAULT_SETTINGS } from '../config';
import { hashPassword, } from '../auth';
import type { Category, Order, OrderStatus, Product, Settings, Stats, User } from '../types';
import { orderId, uid } from '../utils';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './seed';
import type { DataStore } from './types';

/**
 * ইন-মেমরি স্টোর — কোনো এনভায়রনমেন্ট ভ্যারিয়েবল বা ডাটাবেস ছাড়াই সাইট চালায়।
 * Vercel-এ সার্ভারলেস ফাংশন রিস্টার্ট হলে ডেটা রিসেট হবে; স্থায়ী ডেটার জন্য
 * ড্যাশবোর্ড থেকে Neon/Postgres DATABASE_URL যুক্ত করুন (কোড বদলাতে হবে না)।
 */
export class MemoryStore implements DataStore {
  kind = 'memory' as const;

  private settings: Settings = { ...DEFAULT_SETTINGS };
  private users: User[] = [];
  private categories: Category[] = [...SEED_CATEGORIES];
  private products: Product[] = SEED_PRODUCTS.map((p) => ({ ...p }));
  private orders: Order[] = [];
  private seeded = false;

  async init(): Promise<void> {
    if (this.seeded) return;
    this.seeded = true;
    // ডিফল্ট অ্যাডমিন অ্যাকাউন্ট
    const adminHash = await hashPassword('admin123');
    this.users.push({
      id: 'u_admin',
      name: 'অ্যাডমিন',
      email: 'admin@gadgetbazar.com',
      phone: '01712345678',
      passwordHash: adminHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    // ডেমো কাস্টমার
    const demoHash = await hashPassword('demo1234');
    this.users.push({
      id: 'u_demo',
      name: 'রাহিম উদ্দিন',
      email: 'rahim@example.com',
      phone: '01812345678',
      passwordHash: demoHash,
      role: 'customer',
      createdAt: new Date().toISOString(),
    });
    // কয়েকটি ডেমো অর্ডার যাতে অ্যাডমিন ড্যাশবোর্ড খালি না দেখায়
    const mk = (
      id: string,
      userId: string | null,
      name: string,
      phone: string,
      district: string,
      address: string,
      productIds: string[],
      status: OrderStatus,
      hoursAgo: number,
    ): Order => {
      const items = productIds.map((pid) => {
        const p = this.products.find((x) => x.id === pid)!;
        return { productId: p.id, slug: p.slug, name: p.name, price: p.price, qty: 1, image: p.image };
      });
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const deliveryCharge = subtotal >= this.settings.freeDeliveryOver ? 0 : this.settings.deliveryCharge;
      return {
        id,
        userId,
        customer: { name, phone, email: '', address, district, area: '', note: '' },
        items,
        subtotal,
        deliveryCharge,
        discount: 0,
        total: subtotal + deliveryCharge,
        paymentMethod: 'cod',
        status,
        whatsappSent: true,
        createdAt: new Date(Date.now() - hoursAgo * 3600_000).toISOString(),
      };
    };
    this.orders = [
      mk('GB-104521', 'u_demo', 'রাহিম উদ্দিন', '01812345678', 'ঢাকা', 'বাসা ১২, রোড ৫, ধানমন্ডি, ঢাকা', ['p-earbuds', 'p-powerbank'], 'delivered', 72),
      mk('GB-104522', null, 'করিম মিয়া', '01911223344', 'চট্টগ্রাম', 'হোল্ডিং ৪৫, আগ্রাবাদ, চট্টগ্রাম', ['p-smartwatch'], 'shipped', 26),
      mk('GB-104523', null, 'সালমা আক্তার', '01633445566', 'ঢাকা', 'ফ্ল্যাট ৩বি, মিরপুর ১০, ঢাকা', ['p-ringlight', 'p-smartbulb'], 'pending', 3),
    ];
  }

  async getSettings(): Promise<Settings> {
    return { ...this.settings };
  }

  async updateSettings(patch: Partial<Settings>): Promise<Settings> {
    this.settings = { ...this.settings, ...patch };
    return { ...this.settings };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return this.users.find((u) => u.phone === phone) ?? null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async createUser(input: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = { ...input, id: uid('u'), createdAt: new Date().toISOString() };
    this.users.push(user);
    return user;
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<void> {
    const u = this.users.find((x) => x.id === id);
    if (u) u.passwordHash = passwordHash;
  }

  async countUsers(): Promise<number> {
    return this.users.filter((u) => u.role === 'customer').length;
  }

  async listCategories(): Promise<Category[]> {
    return [...this.categories];
  }

  async listProducts(): Promise<Product[]> {
    return [...this.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.products.find((p) => p.slug === slug) ?? null;
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) ?? null;
  }

  async createProduct(input: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const prod: Product = { ...input, id: uid('p'), createdAt: new Date().toISOString() };
    this.products.unshift(prod);
    return prod;
  }

  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.products[idx] = { ...this.products[idx], ...patch, id };
    return this.products[idx];
  }

  async deleteProduct(id: string): Promise<void> {
    this.products = this.products.filter((p) => p.id !== id);
  }

  async createOrder(input: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const order: Order = { ...input, id: orderId(), createdAt: new Date().toISOString() };
    this.orders.unshift(order);
    return order;
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) ?? null;
  }

  async listOrders(): Promise<Order[]> {
    return [...this.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listOrdersByUser(userId: string): Promise<Order[]> {
    return this.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const o = this.orders.find((x) => x.id === id);
    if (!o) return null;
    o.status = status;
    return o;
  }

  async getStats(): Promise<Stats> {
    const orders = await this.listOrders();
    const delivered = orders.filter((o) => o.status === 'delivered' || o.status === 'shipped' || o.status === 'confirmed');
    const revenue = delivered.reduce((s, o) => s + o.total, 0);
    const byStatus: Record<OrderStatus, number> = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => {
      byStatus[o.status] += 1;
    });
    const products = await this.listProducts();
    return {
      totalOrders: orders.length,
      pendingOrders: byStatus.pending,
      totalRevenue: revenue,
      totalCustomers: await this.countUsers(),
      totalProducts: products.length,
      lowStock: products.filter((p) => p.stock <= 5).length,
      recentOrders: orders.slice(0, 6),
      ordersByStatus: byStatus,
    };
  }
}
