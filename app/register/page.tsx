'use client';

import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogoMark } from '@/components/logo';
import { useStore } from '@/components/store-context';
import { Spinner } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser, pushToast } = useStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('পাসওয়ার্ড দুটি মিলছে না');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'রেজিস্ট্রেশন ব্যর্থ');
        setLoading(false);
        return;
      }
      await refreshUser();
      pushToast('অ্যাকাউন্ট তৈরি হয়েছে! স্বাগতম 🎉', 'success');
      router.push('/account');
    } catch {
      setError('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন');
      setLoading(false);
    }
  };

  return (
    <div className="container-gb flex max-w-md flex-col justify-center py-12">
      <div className="card p-7">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="h-14 w-14" />
          <h1 className="mt-3 font-display text-2xl font-extrabold text-ink-900">নতুন অ্যাকাউন্ট</h1>
          <p className="mt-1 text-sm text-ink-500">মাত্র ১ মিনিটেই খুলে ফেলুন আপনার অ্যাকাউন্ট</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="name">পুরো নাম</label>
            <input id="name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="আপনার নাম" required />
          </div>
          <div>
            <label className="label" htmlFor="email">ইমেইল</label>
            <input id="email" type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@example.com" required />
          </div>
          <div>
            <label className="label" htmlFor="phone">মোবাইল নম্বর</label>
            <input id="phone" className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="01XXXXXXXXX" inputMode="numeric" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="password">পাসওয়ার্ড</label>
              <input id="password" type="password" className="input" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" required />
            </div>
            <div>
              <label className="label" htmlFor="confirm">পাসওয়ার্ড আবার</label>
              <input id="confirm" type="password" className="input" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="আবার লিখুন" required />
            </div>
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? <Spinner /> : <UserPlus className="h-5 w-5" />}
            অ্যাকাউন্ট খুলুন
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-600">
          আগে থেকেই অ্যাকাউন্ট আছে?{' '}
          <Link href="/login" className="font-bold text-brand-700 hover:underline">লগইন করুন</Link>
        </p>
      </div>
    </div>
  );
}
