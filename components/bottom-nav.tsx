'use client';

import { Home, LayoutGrid, Package, ShoppingCart, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from './store-context';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', label: 'হোম', icon: Home, match: (p: string) => p === '/' },
  { href: '/products', label: 'শপ', icon: LayoutGrid, match: (p: string) => p.startsWith('/products') || p.startsWith('/category') },
  { href: '/cart', label: 'কার্ট', icon: ShoppingCart, match: (p: string) => p.startsWith('/cart') },
  { href: '/account/orders', label: 'অর্ডার', icon: Package, match: (p: string) => p.startsWith('/account/orders') || p.startsWith('/order') },
  { href: '/account', label: 'অ্যাকাউন্ট', icon: UserRound, match: (p: string) => p === '/account' || p.startsWith('/login') || p.startsWith('/register') },
];

export function BottomNav() {
  const pathname = usePathname();
  const { cartCount, user } = useStore();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="মূল নেভিগেশন"
    >
      <div className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          const isCart = item.href === '/cart';
          const isAccount = item.href === '/account';
          return (
            <Link
              key={item.href}
              href={isAccount && !user ? '/login' : item.href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition',
                active ? 'text-brand-700' : 'text-ink-500 hover:text-ink-700',
              )}
            >
              <span className="relative">
                <Icon className={cn('h-6 w-6', active && 'stroke-[2.4]')} />
                {isCart && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-extrabold text-ink-900">
                    {cartCount > 99 ? '৯+' : cartCount}
                  </span>
                )}
              </span>
              {item.label}
              {active && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-brand-600" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
