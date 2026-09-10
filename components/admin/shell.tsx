'use client';

import { LayoutDashboard, Package, Settings, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { SafeUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LogoMark } from '../logo';
import { Spinner } from '../ui';

const NAV = [
  { href: '/admin', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'অর্ডার', icon: ShoppingCart },
  { href: '/admin/products', label: 'পণ্য', icon: Package },
  { href: '/admin/customers', label: 'কাস্টমার', icon: Users },
  { href: '/admin/settings', label: 'সেটিংস', icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const u = d?.user as SafeUser | null;
        setUser(u ?? null);
        if (!u || u.role !== 'admin') router.replace('/login');
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-brand-600">
        <Spinner className="h-9 w-9" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container-gb max-w-md py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold">অ্যাডমিন লগইন প্রয়োজন</h1>
        <Link href="/login" className="btn-primary mt-4 px-6 py-3">লগইন করুন</Link>
      </div>
    );
  }

  return (
    <div className="container-gb py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-10 w-10" />
          <div>
            <h1 className="font-display text-lg font-extrabold leading-tight text-ink-900">অ্যাডমিন প্যানেল</h1>
            <p className="text-[12px] text-ink-500">স্বাগতম, {user.name}</p>
          </div>
        </div>
        <Link href="/" className="btn-ghost px-4 py-2 text-sm">
          সাইট দেখুন
        </Link>
      </div>

      {/* নেভিগেশন */}
      <nav className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0" aria-label="অ্যাডমিন নেভিগেশন">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'chip shrink-0 !px-4 !py-2.5',
                active ? 'border-brand-600 bg-brand-600 text-white shadow-lift' : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
