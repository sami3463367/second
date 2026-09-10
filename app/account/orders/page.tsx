'use client';

import { PackageOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { bn, bnDateTime, bdt } from '@/lib/bangla';
import type { Order } from '@/lib/types';
import { ORDER_STATUS_LABEL } from '@/lib/types';
import { useStore } from '@/components/store-context';
import { EmptyState, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-accent-100 text-accent-700',
  confirmed: 'bg-brand-100 text-brand-700',
  shipped: 'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function MyOrdersPage() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch('/api/orders/mine', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setOrders(d?.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="container-gb max-w-md py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold">লগইন প্রয়োজন</h1>
        <Link href="/login" className="btn-primary mt-4 px-6 py-3">লগইন করুন</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container-gb max-w-3xl py-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">আমার অর্ডারসমূহ</h1>
      <p className="mt-1 text-sm text-ink-500">আপনার সব অর্ডারের ইতিহাস এখানে।</p>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<PackageOpen className="h-8 w-8" />}
            title="এখনো কোনো অর্ডার নেই"
            description="প্রথম অর্ডারটি করে ফেলুন — ডেলিভারি একদম ফ্রি*!"
            action={<Link href="/products" className="btn-primary mt-1 px-6 py-3">কেনাকাটা শুরু করুন</Link>}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <Link key={o.id} href={`/order-success/${o.id}`} className="card block p-5 transition hover:shadow-lift">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-display text-base font-extrabold text-ink-900">{o.id}</span>
                  <span className="ml-2 text-[12px] text-ink-500">{bnDateTime(o.createdAt)}</span>
                </div>
                <span className={cn('badge-soft', STATUS_STYLE[o.status])}>{ORDER_STATUS_LABEL[o.status]}</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 4).map((it) => (
                    <span key={it.productId} className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-white bg-ink-100">
                      <Image src={it.image} alt={it.name} fill className="object-cover" sizes="48px" />
                    </span>
                  ))}
                </div>
                <div className="min-w-0 flex-1 text-[13px] text-ink-600">
                  {bn(o.items.reduce((s, i) => s + i.qty, 0))} টি পণ্য
                </div>
                <div className="font-display text-lg font-extrabold text-brand-700">{bdt(o.total)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
