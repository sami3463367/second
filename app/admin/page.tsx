'use client';

import { AlertTriangle, Database, IndianRupee, Package, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { bn, bnRelative, bdt } from '@/lib/bangla';
import type { Stats } from '@/lib/types';
import { ORDER_STATUS_LABEL } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui';

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-accent-500',
  confirmed: 'bg-brand-500',
  shipped: 'bg-sky-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [storeKind, setStoreKind] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setStats(d?.stats ?? null);
        setStoreKind(d?.storeKind ?? '');
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!stats) return <p className="py-10 text-center text-ink-500">তথ্য লোড করা যায়নি।</p>;

  const cards = [
    { label: 'মোট অর্ডার', value: bn(stats.totalOrders), icon: <ShoppingCart className="h-5 w-5" />, tone: 'bg-brand-50 text-brand-600' },
    { label: 'অপেক্ষমাণ অর্ডার', value: bn(stats.pendingOrders), icon: <AlertTriangle className="h-5 w-5" />, tone: 'bg-accent-50 text-accent-600' },
    { label: 'মোট আয়', value: bdt(stats.totalRevenue), icon: <IndianRupee className="h-5 w-5" />, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'কাস্টমার', value: bn(stats.totalCustomers), icon: <Users className="h-5 w-5" />, tone: 'bg-sky-50 text-sky-600' },
    { label: 'পণ্য', value: bn(stats.totalProducts), icon: <Package className="h-5 w-5" />, tone: 'bg-violet-50 text-violet-600' },
    { label: 'কম স্টক', value: bn(stats.lowStock), icon: <AlertTriangle className="h-5 w-5" />, tone: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {storeKind === 'memory' && (
        <div className="flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4 text-[13px] leading-relaxed text-accent-800">
          <Database className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>ডেমো স্টোরেজ মোড:</strong> বর্তমানে ডেটা মেমোরিতে সংরক্ষিত হচ্ছে (সার্ভার রিস্টার্টে রিসেট হবে)। স্থায়ী ডেটার জন্য Vercel ড্যাশবোর্ডে একটি ফ্রি Neon/Postgres <code className="rounded bg-white/60 px-1">DATABASE_URL</code> যোগ করুন — কোনো কোড পরিবর্তন লাগবে না। বিস্তারিত README-তে।
          </p>
        </div>
      )}

      {/* স্ট্যাট কার্ড */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', c.tone)}>{c.icon}</span>
            <div className="mt-2.5 font-display text-xl font-extrabold text-ink-900">{c.value}</div>
            <div className="text-[12px] font-semibold text-ink-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* সাম্প্রতিক অর্ডার */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-ink-100 p-5">
            <h2 className="font-display text-lg font-extrabold text-ink-900">সাম্প্রতিক অর্ডার</h2>
            <Link href="/admin/orders" className="text-sm font-bold text-brand-700 hover:underline">সব দেখুন</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-500">এখনো কোনো অর্ডার আসেনি।</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center gap-3 p-4">
                  <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', STATUS_DOT[o.status])} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink-800">{o.id}</span>
                      <span className="truncate text-[13px] text-ink-500">{o.customer.name}</span>
                    </div>
                    <div className="text-[12px] text-ink-400">{bnRelative(o.createdAt)} • {bn(o.items.length)} টি পণ্য</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-extrabold text-ink-900">{bdt(o.total)}</div>
                    <div className="text-[11px] font-semibold text-ink-500">{ORDER_STATUS_LABEL[o.status]}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* স্ট্যাটাস ভাঙন */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-extrabold text-ink-900">অর্ডার স্ট্যাটাস</h2>
          <ul className="mt-4 space-y-3">
            {(Object.keys(stats.ordersByStatus) as (keyof typeof stats.ordersByStatus)[]).map((s) => {
              const count = stats.ordersByStatus[s];
              const pct = stats.totalOrders ? Math.round((count / stats.totalOrders) * 100) : 0;
              return (
                <li key={s}>
                  <div className="mb-1 flex items-center justify-between text-[13px] font-semibold">
                    <span className="flex items-center gap-2 text-ink-700">
                      <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT[s])} />
                      {ORDER_STATUS_LABEL[s]}
                    </span>
                    <span className="text-ink-500">{bn(count)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div className={cn('h-full rounded-full', STATUS_DOT[s])} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
