'use client';

import { KeyRound, LogOut, Package, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { bnDate } from '@/lib/bangla';
import { useStore } from '@/components/store-context';
import { Spinner } from '@/components/ui';

export default function AccountPage() {
  const { user, refreshUser, pushToast } = useStore();
  const router = useRouter();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await refreshUser();
    pushToast('লগআউট হয়েছে', 'info');
    router.push('/');
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pw.next !== pw.confirm) return setPwError('নতুন পাসওয়ার্ড দুটি মিলছে না');
    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: pw.current, next: pw.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data?.error || 'পাসওয়ার্ড বদলানো যায়নি');
      } else {
        pushToast('পাসওয়ার্ড পরিবর্তন হয়েছে 🔒', 'success');
        setPw({ current: '', next: '', confirm: '' });
      }
    } catch {
      setPwError('নেটওয়ার্ক সমস্যা');
    }
    setPwLoading(false);
  };

  if (!user) {
    return (
      <div className="container-gb max-w-md py-16 text-center">
        <UserRound className="mx-auto h-12 w-12 text-ink-300" />
        <h1 className="mt-3 font-display text-2xl font-extrabold">লগইন প্রয়োজন</h1>
        <p className="mt-1 text-sm text-ink-500">অ্যাকাউন্ট দেখতে লগইন করুন বা নতুন অ্যাকাউন্ট খুলুন।</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href="/login" className="btn-primary py-3">লগইন</Link>
          <Link href="/register" className="btn-ghost py-3">রেজিস্টার</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-gb max-w-3xl py-8">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-4 bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-6 text-white">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 font-display text-2xl font-black">
            {user.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-extrabold">{user.name}</h1>
            <p className="truncate text-sm text-brand-100">{user.email}</p>
            <span className="badge-soft mt-1.5 bg-white/15 text-white">
              {user.role === 'admin' ? 'অ্যাডমিন' : 'কাস্টমার'}
            </span>
          </div>
        </div>

        <dl className="grid gap-4 p-6 sm:grid-cols-3">
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">মোবাইল</dt>
            <dd className="mt-0.5 font-semibold">{user.phone}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">যোগদান</dt>
            <dd className="mt-0.5 font-semibold">{bnDate(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">অ্যাকাউন্ট আইডি</dt>
            <dd className="mt-0.5 truncate font-mono text-[13px] font-semibold">{user.id}</dd>
          </div>
        </dl>

        <div className="grid gap-3 border-t border-ink-100 p-6 sm:grid-cols-2">
          <Link href="/account/orders" className="btn-ghost py-3">
            <Package className="h-5 w-5" /> আমার অর্ডারসমূহ
          </Link>
          <button type="button" onClick={logout} className="btn-danger py-3">
            <LogOut className="h-5 w-5" /> লগআউট
          </button>
        </div>
      </div>

      {/* পাসওয়ার্ড */}
      <div className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink-900">
          <KeyRound className="h-5 w-5 text-brand-600" /> পাসওয়ার্ড পরিবর্তন
        </h2>
        <form onSubmit={changePw} className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="cur">বর্তমান পাসওয়ার্ড</label>
            <input id="cur" type="password" className="input" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} required />
          </div>
          <div>
            <label className="label" htmlFor="next">নতুন পাসওয়ার্ড</label>
            <input id="next" type="password" className="input" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} required />
          </div>
          <div>
            <label className="label" htmlFor="confirm">নতুন পাসওয়ার্ড আবার</label>
            <input id="confirm" type="password" className="input" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} required />
          </div>
          {pwError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:col-span-3">{pwError}</p>}
          <div className="sm:col-span-3">
            <button type="submit" disabled={pwLoading} className="btn-primary px-6 py-3">
              {pwLoading ? <Spinner /> : null} পাসওয়ার্ড বদলান
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
