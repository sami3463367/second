'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-extrabold text-ink-900 sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function QtyStepper({
  qty,
  onChange,
  max = 99,
  size = 'md',
}: {
  qty: number;
  onChange: (n: number) => void;
  max?: number;
  size?: 'sm' | 'md';
}) {
  const btn = cn(
    'flex items-center justify-center rounded-lg bg-ink-100 text-ink-700 transition hover:bg-ink-200 active:scale-90 disabled:opacity-40',
    size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
  );
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1">
      <button type="button" className={btn} onClick={() => onChange(qty - 1)} aria-label="কমান">
        <Minus className="h-4 w-4" />
      </button>
      <span className={cn('text-center font-bold tabular-nums', size === 'sm' ? 'w-8 text-sm' : 'w-10')}>{qty}</span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        aria-label="বাড়ান"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">{icon}</span>
      <h3 className="font-display text-lg font-bold text-ink-800">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      role="status"
      aria-label="লোড হচ্ছে"
    />
  );
}
