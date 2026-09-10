import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { DEFAULT_SETTINGS } from '../config';
import { hashPassword } from '../auth';
import type { Category, Order, OrderStatus, Product, Settings, Stats, User } from '../types';
import { orderId, uid } from '../utils';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './seed';
import type { DataStore } from './types';

type Row = Record<string, any>;

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS gb_settings (
     id INTEGER PRIMARY KEY,
     data JSONB NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS gb_users (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT NOT NULL UNIQUE,
     phone TEXT NOT NULL UNIQUE,
     password_hash TEXT NOT NULL,
     role TEXT NOT NULL DEFAULT 'customer',
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS gb_categories (
     slug TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     icon TEXT NOT NULL DEFAULT '',
     description TEXT NOT NULL DEFAULT ''
   )`,
  `CREATE TABLE IF NOT EXISTS gb_products (
     id TEXT PRIMARY KEY,
     slug TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL,
     category TEXT NOT NULL,
     price INTEGER NOT NULL,
     old_price INTEGER,
     image TEXT NOT NULL,
     short_description TEXT NOT NULL DEFAULT '',
     description TEXT NOT NULL DEFAULT '',
     features JSONB NOT NULL DEFAULT '[]',
     specs JSONB NOT NULL DEFAULT '[]',
     stock INTEGER NOT NULL DEFAULT 0,
     rating REAL NOT NULL DEFAULT 0,
     review_count INTEGER NOT NULL DEFAULT 0,
     badge TEXT,
     featured BOOLEAN NOT NULL DEFAULT FALSE,
     active BOOLEAN NOT NULL DEFAULT TRUE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS gb_orders (
     id TEXT PRIMARY KEY,
     user_id TEXT,
     customer JSONB NOT NULL,
     items JSONB NOT NULL,
     subtotal INTEGER NOT NULL,
     delivery_charge INTEGER NOT NULL,
     discount INTEGER NOT NULL DEFAULT 0,
     total INTEGER NOT NULL,
     payment_method TEXT NOT NULL DEFAULT 'cod',
     status TEXT NOT NULL DEFAULT 'pending',
     whatsapp_sent BOOLEAN NOT NULL DEFAULT FALSE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
];

function productFromRow(r: Row): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    price: Number(r.price),
    oldPrice: r.old_price == null ? null : Number(r.old_price),
    image: r.image,
    shortDescription: r.short_description,
    description: r.description,
    features: Array.isArray(r.features) ? r.features : [],
    specs: Array.isArray(r.specs) ? r.specs : [],
    stock: Number(r.stock),
    rating: Number(r.rating),
    reviewCount: Number(r.review_count),
    badge: r.badge ?? null,
    featured: Boolean(r.featured),
    active: Boolean(r.active),
    createdAt: new Date(r.created_at).toISOString(),
  };
}

function orderFromRow(r: Row): Order {
  return {
    id: r.id,
    userId: r.user_id ?? null,
    customer: r.customer,
    items: r.items,
    subtotal: Number(r.subtotal),
    deliveryCharge: Number(r.delivery_charge),
    discount: Number(r.discount),
    total: Number(r.total),
    paymentMethod: 'cod',
    status: r.status as OrderStatus,
    whatsappSent: Boolean(r.whatsapp_sent),
    createdAt: new Date(r.created_at).toISOString(),
  };
}

function userFromRow(r: Row): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    passwordHash: r.password_hash,
    role: r.role,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export class PostgresStore implements DataStore {
  kind = 'postgres' as const;
  private sql: NeonQueryFunction<false, false>;
  private ready = false;

  constructor(connectionString: string) {
    this.sql = neon(connectionString) as NeonQueryFunction<false, false>;
  }

  async init(): Promise<void> {
    if (this.ready) return;
    for (const stmt of DDL) {
      // eslint-disable-next-line no-await-in-loop
      await this.sql(stmt, []);
    }
    // settings row
    const settingsRows = (await this.sql(`SELECT id FROM gb_settings WHERE id = 1`, [])) as Row[];
    if (settingsRows.length === 0) {
      await this.sql(`INSERT INTO gb_settings (id, data) VALUES (1, $1)`, [
        JSON.stringify(DEFAULT_SETTINGS),
      ]);
    }
    // categories
    const catRows = (await this.sql(`SELECT COUNT(*)::int AS n FROM gb_categories`, [])) as Row[];
    if (Number(catRows[0]?.n ?? 0) === 0) {
      for (const c of SEED_CATEGORIES) {
        // eslint-disable-next-line no-await-in-loop
        await this.sql(
          `INSERT INTO gb_categories (slug, name, icon, description) VALUES ($1,$2,$3,$4)
           ON CONFLICT (slug) DO NOTHING`,
          [c.slug, c.name, c.icon, c.description],
        );
      }
    }
    // products
    const prodRows = (await this.sql(`SELECT COUNT(*)::int AS n FROM gb_products`, [])) as Row[];
    if (Number(prodRows[0]?.n ?? 0) === 0) {
      for (const p of SEED_PRODUCTS) {
        // eslint-disable-next-line no-await-in-loop
        await this.sql(
          `INSERT INTO gb_products (id, slug, name, category, price, old_price, image, short_description,
             description, features, specs, stock, rating, review_count, badge, featured, active, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           ON CONFLICT (id) DO NOTHING`,
          [
            p.id,
            p.slug,
            p.name,
            p.category,
            p.price,
            p.oldPrice,
            p.image,
            p.shortDescription,
            p.description,
            JSON.stringify(p.features),
            JSON.stringify(p.specs),
            p.stock,
            p.rating,
            p.reviewCount,
            p.badge,
            p.featured,
            p.active,
            p.createdAt,
          ],
        );
      }
    }
    // admin
    const userRows = (await this.sql(`SELECT COUNT(*)::int AS n FROM gb_users`, [])) as Row[];
    if (Number(userRows[0]?.n ?? 0) === 0) {
      const adminHash = await hashPassword('admin123');
      await this.sql(
        `INSERT INTO gb_users (id, name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5,'admin')`,
        ['u_admin', 'অ্যাডমিন', 'admin@gadgetbazar.com', '01712345678', adminHash],
      );
    }
    this.ready = true;
  }

  async getSettings(): Promise<Settings> {
    const rows = (await this.sql(`SELECT data FROM gb_settings WHERE id = 1`, [])) as Row[];
    const data = (rows[0]?.data ?? {}) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...data } as Settings;
  }

  async updateSettings(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const next = { ...current, ...patch };
    await this.sql(`UPDATE gb_settings SET data = $1 WHERE id = 1`, [JSON.stringify(next)]);
    return next;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const rows = (await this.sql(`SELECT * FROM gb_users WHERE LOWER(email) = LOWER($1) LIMIT 1`, [
      email,
    ])) as Row[];
    return rows[0] ? userFromRow(rows[0]) : null;
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    const rows = (await this.sql(`SELECT * FROM gb_users WHERE phone = $1 LIMIT 1`, [phone])) as Row[];
    return rows[0] ? userFromRow(rows[0]) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const rows = (await this.sql(`SELECT * FROM gb_users WHERE id = $1 LIMIT 1`, [id])) as Row[];
    return rows[0] ? userFromRow(rows[0]) : null;
  }

  async createUser(input: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = uid('u');
    await this.sql(
      `INSERT INTO gb_users (id, name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, input.name, input.email, input.phone, input.passwordHash, input.role],
    );
    const created = await this.getUserById(id);
    return created!;
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<void> {
    await this.sql(`UPDATE gb_users SET password_hash = $1 WHERE id = $2`, [passwordHash, id]);
  }

  async countUsers(): Promise<number> {
    const rows = (await this.sql(`SELECT COUNT(*)::int AS n FROM gb_users WHERE role = 'customer'`, [])) as Row[];
    return Number(rows[0]?.n ?? 0);
  }

  async listCategories(): Promise<Category[]> {
    const rows = (await this.sql(`SELECT * FROM gb_categories ORDER BY name`, [])) as Row[];
    return rows.map((r) => ({ slug: r.slug, name: r.name, icon: r.icon, description: r.description }));
  }

  async listProducts(): Promise<Product[]> {
    const rows = (await this.sql(`SELECT * FROM gb_products ORDER BY created_at DESC`, [])) as Row[];
    return rows.map(productFromRow);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const rows = (await this.sql(`SELECT * FROM gb_products WHERE slug = $1 LIMIT 1`, [slug])) as Row[];
    return rows[0] ? productFromRow(rows[0]) : null;
  }

  async getProductById(id: string): Promise<Product | null> {
    const rows = (await this.sql(`SELECT * FROM gb_products WHERE id = $1 LIMIT 1`, [id])) as Row[];
    return rows[0] ? productFromRow(rows[0]) : null;
  }

  async createProduct(input: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const id = uid('p');
    await this.sql(
      `INSERT INTO gb_products (id, slug, name, category, price, old_price, image, short_description,
         description, features, specs, stock, rating, review_count, badge, featured, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        id,
        input.slug,
        input.name,
        input.category,
        input.price,
        input.oldPrice,
        input.image,
        input.shortDescription,
        input.description,
        JSON.stringify(input.features),
        JSON.stringify(input.specs),
        input.stock,
        input.rating,
        input.reviewCount,
        input.badge,
        input.featured,
        input.active,
      ],
    );
    const created = await this.getProductById(id);
    return created!;
  }

  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    const push = (col: string, val: unknown) => {
      vals.push(val);
      sets.push(`${col} = $${vals.length}`);
    };
    if (patch.slug !== undefined) push('slug', patch.slug);
    if (patch.name !== undefined) push('name', patch.name);
    if (patch.category !== undefined) push('category', patch.category);
    if (patch.price !== undefined) push('price', patch.price);
    if (patch.oldPrice !== undefined) push('old_price', patch.oldPrice);
    if (patch.image !== undefined) push('image', patch.image);
    if (patch.shortDescription !== undefined) push('short_description', patch.shortDescription);
    if (patch.description !== undefined) push('description', patch.description);
    if (patch.features !== undefined) push('features', JSON.stringify(patch.features));
    if (patch.specs !== undefined) push('specs', JSON.stringify(patch.specs));
    if (patch.stock !== undefined) push('stock', patch.stock);
    if (patch.rating !== undefined) push('rating', patch.rating);
    if (patch.reviewCount !== undefined) push('review_count', patch.reviewCount);
    if (patch.badge !== undefined) push('badge', patch.badge);
    if (patch.featured !== undefined) push('featured', patch.featured);
    if (patch.active !== undefined) push('active', patch.active);
    if (sets.length === 0) return this.getProductById(id);
    vals.push(id);
    await this.sql(`UPDATE gb_products SET ${sets.join(', ')} WHERE id = $${vals.length}`, vals);
    return this.getProductById(id);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.sql(`DELETE FROM gb_products WHERE id = $1`, [id]);
  }

  async createOrder(input: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const id = orderId();
    await this.sql(
      `INSERT INTO gb_orders (id, user_id, customer, items, subtotal, delivery_charge, discount, total,
         payment_method, status, whatsapp_sent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        id,
        input.userId,
        JSON.stringify(input.customer),
        JSON.stringify(input.items),
        input.subtotal,
        input.deliveryCharge,
        input.discount,
        input.total,
        input.paymentMethod,
        input.status,
        input.whatsappSent,
      ],
    );
    const created = await this.getOrderById(id);
    return created!;
  }

  async getOrderById(id: string): Promise<Order | null> {
    const rows = (await this.sql(`SELECT * FROM gb_orders WHERE id = $1 LIMIT 1`, [id])) as Row[];
    return rows[0] ? orderFromRow(rows[0]) : null;
  }

  async listOrders(): Promise<Order[]> {
    const rows = (await this.sql(`SELECT * FROM gb_orders ORDER BY created_at DESC`, [])) as Row[];
    return rows.map(orderFromRow);
  }

  async listOrdersByUser(userId: string): Promise<Order[]> {
    const rows = (await this.sql(`SELECT * FROM gb_orders WHERE user_id = $1 ORDER BY created_at DESC`, [
      userId,
    ])) as Row[];
    return rows.map(orderFromRow);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    await this.sql(`UPDATE gb_orders SET status = $1 WHERE id = $2`, [status, id]);
    return this.getOrderById(id);
  }

  async getStats(): Promise<Stats> {
    const orders = await this.listOrders();
    const revenueRows = (await this.sql(
      `SELECT COALESCE(SUM(total),0)::int AS revenue FROM gb_orders WHERE status IN ('confirmed','shipped','delivered')`,
      [],
    )) as Row[];
    const byStatus: Record<OrderStatus, number> = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach((o) => {
      byStatus[o.status] += 1;
    });
    const products = await this.listProducts();
    return {
      totalOrders: orders.length,
      pendingOrders: byStatus.pending,
      totalRevenue: Number(revenueRows[0]?.revenue ?? 0),
      totalCustomers: await this.countUsers(),
      totalProducts: products.length,
      lowStock: products.filter((p) => p.stock <= 5).length,
      recentOrders: orders.slice(0, 6),
      ordersByStatus: byStatus,
    };
  }
}
