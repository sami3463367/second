'use client';

import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { bn, bnDateTime, bdt } from '@/lib/bangla';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABEL } from '@/lib/types';
import { cn, normalizePhoneForWa } from '@/lib/utils';
import { Spinner } from '@/components/ui';
import { WhatsAppIcon } from '@/components/icons';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: 'bg-accent-100 text-accent-700',
  confirmed: 'bg-brand-100 text-brand-700',
  shipped: 'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | OrderStatus>('');
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = () => {
    fetch('/api/admin/orders', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setOrders(d?.orders ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter) list = list.filter((o) => o.status === statusFilter);
    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(term) ||
          o.customer.name.toLowerCase().includes(term) ||
          o.customer.phone.includes(term),
      );
    }
    return list;
  }, [orders, statusFilter, query]);

  const setStatus = async (id: string, status: OrderStatus) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data?.order) {
        setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o)));
      }
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="অর্ডার আইডি / নাম / ফোন খুঁজুন…" className="input py-2.5 pl-11" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as '' | OrderStatus)} className="input w-auto py-2.5 text-sm font-semibold">
          <option value="">সব স্ট্যাটাস</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="card p-10 text-center text-ink-500">কোনো অর্ডার পাওয়া যায়নি।</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="card overflow-hidden">
              <button type="button" onClick={() => setOpen(open === o.id ? null : o.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-extrabold text-ink-900">{o.id}</span>
                    <span className={cn('badge-soft', STATUS_STYLE[o.status])}>{ORDER_STATUS_LABEL[o.status]}</span>
                    {saving === o.id && <Spinner className="h-3.5 w-3.5 text-brand-600" />}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-ink-500">
                    {o.customer.name} • {o.customer.phone} • {bnDateTime(o.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-extrabold text-brand-700">{bdt(o.total)}</div>
                  <div className="text-[12px] text-ink-400">{bn(o.items.length)} টি পণ্য</div>
                </div>
                {open === o.id ? <ChevronUp className="h-5 w-5 shrink-0 text-ink-400" /> : <ChevronDown className="h-5 w-5 shrink-0 text-ink-400" />}
              </button>

              {open === o.id && (
                <div className="border-t border-ink-100 bg-ink-50/50 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-400">গ্রাহকের তথ্য</h3>
                      <dl className="space-y-1.5 text-[14px]">
                        <div className="flex justify-between gap-3"><dt className="text-ink-500">নাম</dt><dd className="font-semibold">{o.customer.name}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-ink-500">মোবাইল</dt><dd className="font-semibold">{o.customer.phone}</dd></div>
                        {o.customer.email && <div className="flex justify-between gap-3"><dt className="text-ink-500">ইমেইল</dt><dd className="font-semibold">{o.customer.email}</dd></div>}
                        <div className="flex justify-between gap-3"><dt className="text-ink-500">জেলা</dt><dd className="font-semibold">{o.customer.district}{o.customer.area ? `, ${o.customer.area}` : ''}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-ink-500">ঠিকানা</dt><dd className="max-w-[60%] text-right font-semibold">{o.customer.address}</dd></div>
                        {o.customer.note && <div className="flex justify-between gap-3"><dt className="text-ink-500">নোট</dt><dd className="max-w-[60%] text-right font-semibold">{o.customer.note}</dd></div>}
                      </dl>
                    </div>
                    <div>
                      <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-400">পণ্যসমূহ</h3>
                      <ul className="space-y-2">
                        {o.items.map((it) => (
                          <li key={it.productId} className="flex items-center gap-2.5">
                            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-ink-100">
                              <Image src={it.image} alt={it.name} fill className="object-cover" sizes="40px" />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-700">{it.name}</span>
                            <span className="text-[13px] text-ink-500">{bn(it.qty)} ×</span>
                            <span className="text-[13px] font-bold">{bdt(it.price * it.qty)}</span>
                          </li>
                        ))}
                      </ul>
                      <dl className="mt-3 space-y-1 border-t border-dashed border-ink-200 pt-2 text-[13px]">
                        <div className="flex justify-between"><dt className="text-ink-500">সাবটোটাল</dt><dd>{bdt(o.subtotal)}</dd></div>
                        <div className="flex justify-between"><dt className="text-ink-500">ডেলিভারি</dt><dd>{o.deliveryCharge === 0 ? 'ফ্রি' : bdt(o.deliveryCharge)}</dd></div>
                        <div className="flex justify-between font-bold"><dt>সর্বমোট</dt><dd>{bdt(o.total)}</dd></div>
                        <div className="flex justify-between"><dt className="text-ink-500">পেমেন্ট</dt><dd>ক্যাশ অন ডেলিভারি</dd></div>
                      </dl>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <label className="text-[13px] font-bold text-ink-600" htmlFor={`status-${o.id}`}>স্ট্যাটাস:</label>
                    <select
                      id={`status-${o.id}`}
                      value={o.status}
                      disabled={saving === o.id}
                      onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                      className="input w-auto py-2 text-sm font-semibold"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                    <a
                      href={`https://wa.me/${normalizePhoneForWa(o.customer.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-wa ml-auto px-4 py-2 text-sm"
                    >
                      <WhatsAppIcon className="h-4 w-4" /> গ্রাহককে মেসেজ
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
