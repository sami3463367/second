'use client';

import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogoMark } from '@/components/logo';
import { useStore } from '@/components/store-context';
import { Spinner } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser, pushToast } = useStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'লগইন ব্যর্থ');
        setLoading(false);
        return;
      }
      await refreshUser();
      pushToast(`স্বাগতম, ${data.user?.name || ''}! 👋`, 'success');
      router.push(data.user?.role === 'admin' ? '/admin' : '/account');
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
          <h1 className="mt-3 font-display text-2xl font-extrabold text-ink-900">লগইন করুন</h1>
          <p className="mt-1 text-sm text-ink-500">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="identifier">ইমেইল বা মোবাইল নম্বর</label>
            <input id="identifier" className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="email@example.com / 01XXXXXXXXX" required />
          </div>
          <div>
            <label className="label" htmlFor="password">পাসওয়ার্ড</label>
            <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading ? <Spinner /> : <LogIn className="h-5 w-5" />}
            লগইন
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-600">
          অ্যাকাউন্ট নেই?{' '}
          <Link href="/register" className="font-bold text-brand-700 hover:underline">রেজিস্টার করুন</Link>
        </p>

        <div className="mt-5 rounded-xl bg-ink-50 p-3.5 text-[12px] leading-relaxed text-ink-500">
          <strong className="text-ink-700">ডেমো লগইন:</strong><br />
          অ্যাডমিন — admin@gadgetbazar.com / admin123<br />
          কাস্টমার — rahim@example.com / demo1234
        </div>
      </div>
    </div>
  );
}
