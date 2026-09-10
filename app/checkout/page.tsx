'use client';

import { ArrowLeft, Banknote, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { bn, bdt } from '@/lib/bangla';
import { DISTRICTS } from '@/lib/config';
import type { CustomerInfo } from '@/lib/types';
import { isValidBdPhone, isValidEmail } from '@/lib/utils';
import { useStore } from '@/components/store-context';
import { EmptyState, Spinner } from '@/components/ui';

const EMPTY: CustomerInfo = { name: '', phone: '', email: '', address: '', district: 'ঢাকা', area: '', note: '' };

export default function CheckoutPage() {
  const { cart, totals, user, clearCartAll, district, setDistrict, pushToast } = useStore();
  const router = useRouter();
  const [form, setForm] = useState<CustomerInfo>({ ...EMPTY, district });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm((f) => ({ ...f, district }));
  }, [district]);

  // লগইন থাকলে প্রিফিল
  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: f.name || user.name, phone: f.phone || user.phone, email: f.email || user.email }));
    }
  }, [user]);

  const set = (k: keyof CustomerInfo, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 3) return setError('আপনার পুরো নাম লিখুন');
    if (!isValidBdPhone(form.phone)) return setError('সঠিক মোবাইল নম্বর দিন (যেমন 01712345678)');
    if (form.email && !isValidEmail(form.email)) return setError('সঠিক ইমেইল ঠিকানা দিন');
    if (form.address.trim().length < 10) return setError('সম্পূর্ণ ঠিকানা লিখুন (বাসা/রোড/এলাকা)');

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: { ...form, district }, items: cart }),
      });
      const data = await res.json();
      if (!res.ok || !data?.order) {
        setError(data?.error || 'অর্ডার তৈরি করা যায়নি');
        setSubmitting(false);
        return;
      }
      clearCartAll();
      pushToast('অর্ডার সফলভাবে তৈরি হয়েছে! 🎉', 'success');
      router.push(`/order-success/${data.order.id}`);
    } catch {
      setError('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন');
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container-gb py-10">
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="চেকআউটের জন্য কার্ট খালি"
          description="আগে পণ্য যোগ করুন, তারপর চেকআউট করুন।"
          action={
            <Link href="/products" className="btn-primary mt-1 px-6 py-3">
              পণ্য দেখুন <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-gb py-6">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">চেকআউট</h1>
      <p className="mt-1 text-sm text-ink-500">ডেলিভারির তথ্য দিন — পেমেন্ট হবে পণ্য হাতে পেয়ে (ক্যাশ অন ডেলিভারি)।</p>

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card space-y-4 p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-extrabold text-ink-900">ডেলিভারি তথ্য</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">পুরো নাম *</label>
              <input id="name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="যেমন: মোহাম্মদ রাহিম" required />
            </div>
            <div>
              <label className="label" htmlFor="phone">মোবাইল নম্বর *</label>
              <input id="phone" className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="01XXXXXXXXX" inputMode="numeric" required />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="email">ইমেইল (ঐচ্ছিক)</label>
            <input id="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="example@mail.com" inputMode="email" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="district">জেলা *</label>
              <select id="district" className="input" value={form.district} onChange={(e) => { set('district', e.target.value); setDistrict(e.target.value); }} required>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="area">এলাকা / থানা</label>
              <input id="area" className="input" value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="যেমন: ধানমন্ডি" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="address">সম্পূর্ণ ঠিকানা *</label>
            <textarea id="address" className="input min-h-[92px]" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="বাসা/হোল্ডিং, রোড, এলাকা, থানা, জেলা" required />
          </div>

          <div>
            <label className="label" htmlFor="note">অর্ডার নোট (ঐচ্ছিক)</label>
            <textarea id="note" className="input min-h-[70px]" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন" />
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
            <Banknote className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-[13px] leading-relaxed">
              <strong>ক্যাশ অন ডেলিভারি:</strong> অর্ডার কনফার্ম করার পর কোনো অগ্রিম পেমেন্ট লাগবে না। ডেলিভারি ম্যানের কাছে পণ্য হাতে পেয়ে টাকা পরিশোধ করবেন।
            </p>
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-base">
            {submitting ? <Spinner /> : null}
            {submitting ? 'অর্ডার তৈরি হচ্ছে…' : `অর্ডার কনফার্ম করুন — ${bdt(totals.total)}`}
          </button>
        </div>

        {/* সারাংশ */}
        <aside className="card h-fit p-5">
          <h2 className="font-display text-lg font-extrabold text-ink-900">আপনার অর্ডার</h2>
          <ul className="mt-4 space-y-3">
            {cart.map((it) => (
              <li key={it.productId} className="flex items-center gap-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                  <Image src={it.image} alt={it.name} fill className="object-cover" sizes="56px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink-800">{it.name}</span>
                  <span className="block text-[12px] text-ink-500">{bn(it.qty)} × {bdt(it.price)}</span>
                </span>
                <span className="text-[13px] font-bold">{bdt(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-dashed border-ink-200 pt-4 text-[14px]">
            <div className="flex justify-between"><dt className="text-ink-600">সাবটোটাল</dt><dd className="font-semibold">{bdt(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-600">ডেলিভারি</dt><dd className="font-semibold">{totals.deliveryCharge === 0 ? 'ফ্রি' : bdt(totals.deliveryCharge)}</dd></div>
            <div className="flex justify-between text-base"><dt className="font-bold">সর্বমোট</dt><dd className="font-display text-lg font-black text-brand-700">{bdt(totals.total)}</dd></div>
          </dl>
        </aside>
      </form>
    </div>
  );
}
