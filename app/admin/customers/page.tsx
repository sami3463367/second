'use client';

import { useEffect, useState } from 'react';
import { bn, bnDate, bdt } from '@/lib/bangla';
import { normalizePhoneForWa } from '@/lib/utils';
import { Spinner } from '@/components/ui';
import { WhatsAppIcon } from '@/components/icons';

interface CustomerRow {
  name: string;
  phone: string;
  email: string;
  district: string;
  orders: number;
  spent: number;
  lastOrder: string;
  registered: boolean;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setCustomers(d?.customers ?? []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (customers.length === 0) {
    return <p className="card p-10 text-center text-ink-500">এখনো কোনো কাস্টমার নেই।</p>;
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-[14px]">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-[12px] uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3 font-bold">কাস্টমার</th>
            <th className="px-4 py-3 font-bold">জেলা</th>
            <th className="px-4 py-3 font-bold">অর্ডার</th>
            <th className="px-4 py-3 font-bold">মোট খরচ</th>
            <th className="px-4 py-3 font-bold">শেষ অর্ডার</th>
            <th className="px-4 py-3 font-bold">যোগাযোগ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {customers.map((c) => (
            <tr key={c.phone} className="hover:bg-ink-50/40">
              <td className="px-4 py-3">
                <div className="font-bold text-ink-800">{c.name}</div>
                <div className="text-[12px] text-ink-500">{c.phone}{c.email ? ` • ${c.email}` : ''}</div>
              </td>
              <td className="px-4 py-3 text-ink-600">{c.district}</td>
              <td className="px-4 py-3 font-semibold">{bn(c.orders)}</td>
              <td className="px-4 py-3 font-bold text-brand-700">{bdt(c.spent)}</td>
              <td className="px-4 py-3 text-ink-600">{bnDate(c.lastOrder)}</td>
              <td className="px-4 py-3">
                <a
                  href={`https://wa.me/${normalizePhoneForWa(c.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wa px-3 py-1.5 text-[12px]"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" /> মেসেজ
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
