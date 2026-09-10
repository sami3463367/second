'use client';

import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useStore } from './store-context';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex w-full max-w-sm animate-pop items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold shadow-card backdrop-blur',
            t.type === 'success' && 'border-emerald-200 bg-emerald-50/95 text-emerald-800',
            t.type === 'error' && 'border-red-200 bg-red-50/95 text-red-800',
            t.type === 'info' && 'border-brand-200 bg-brand-50/95 text-brand-800',
          )}
        >
          <span className="mt-0.5 shrink-0">
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
            {t.type === 'error' && <XCircle className="h-5 w-5" />}
            {t.type === 'info' && <Info className="h-5 w-5" />}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100"
            aria-label="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
