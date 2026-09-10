'use client';

import { ShoppingCart, Search, UserRound, Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './logo';
import { useStore } from './store-context';

export function Header() {
  const { cartCount, user, settings } = useStore();
  const router = useRouter();
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : '/products');
  };

  return (
    <header className="sticky top-0 z-40">
      {/* ঘোষণা বার */}
      {settings.announcement && (
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 py-1.5 text-center">
          <p className="container-gb truncate text-[12px] font-semibold text-white sm:text-[13px]">
            {settings.announcement}
          </p>
        </div>
      )}

      <div className="glass border-b border-ink-200/70 shadow-[0_1px_0_rgba(15,23,42,.03)]">
        <div className="container-gb">
          {/* উপরের সারি */}
          <div className="flex items-center justify-between gap-3 py-2.5">
            <Link href="/" aria-label="হোম">
              <Logo compact />
            </Link>

            {/* ডেস্কটপ সার্চ */}
            <form onSubmit={submit} className="relative hidden max-w-md flex-1 md:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="পণ্য খুঁজুন… (যেমন: স্মার্টওয়াচ)"
                className="input py-2.5 pl-11 pr-4"
                aria-label="পণ্য খুঁজুন"
              />
            </form>

            <div className="flex items-center gap-1.5">
              <Link
                href="/admin"
                className="hidden items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-600 transition hover:border-brand-300 hover:text-brand-700 md:inline-flex"
                title="অ্যাডমিন প্যানেল"
              >
                <Store className="h-4 w-4" />
                অ্যাডমিন
              </Link>
              <Link
                href={user ? '/account' : '/login'}
                className="btn-ghost h-10 w-10 !p-0"
                aria-label="অ্যাকাউন্ট"
                title={user ? user.name : 'লগইন / রেজিস্টার'}
              >
                <UserRound className="h-5 w-5" />
              </Link>
              <Link href="/cart" className="btn-primary relative h-10 w-10 !p-0" aria-label="কার্ট">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-extrabold text-ink-900 shadow">
                    {cartCount > 99 ? '৯+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* মোবাইল সার্চ */}
          <form onSubmit={submit} className="relative pb-2.5 md:hidden">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-[60%] text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="পণ্য খুঁজুন…"
              className="input py-2.5 pl-11 pr-4"
              aria-label="পণ্য খুঁজুন"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
