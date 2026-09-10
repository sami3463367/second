import { forbidden, json, serverError } from '@/lib/api';
import { guardAdmin } from '@/lib/api';
import { db } from '@/lib/store';
import { toSafeUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await guardAdmin();
  if (!admin) return forbidden();
  try {
    const store = await db();
    const orders = await store.listOrders();
    // অর্ডার থেকে গেস্ট কাস্টমারও তালিকাভুক্ত করা
    const byPhone = new Map<string, { name: string; phone: string; email: string; district: string; orders: number; spent: number; lastOrder: string; registered: boolean }>();
    orders.forEach((o) => {
      const key = o.customer.phone;
      const existing = byPhone.get(key);
      if (existing) {
        existing.orders += 1;
        existing.spent += o.total;
        if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
      } else {
        byPhone.set(key, {
          name: o.customer.name,
          phone: o.customer.phone,
          email: o.customer.email || '',
          district: o.customer.district,
          orders: 1,
          spent: o.total,
          lastOrder: o.createdAt,
          registered: false,
        });
      }
    });
    return json({ ok: true, customers: Array.from(byPhone.values()).sort((a, b) => b.lastOrder.localeCompare(a.lastOrder)) });
  } catch {
    return serverError();
  }
}
