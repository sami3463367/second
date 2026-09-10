import { cn } from '@/lib/utils';

/** ব্র্যান্ড লোগো — ব্যাগ + বজ্রচিহ্ন */
export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 shadow-lift',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[62%] w-[62%] text-white">
        {/* ব্যাগ */}
        <path
          d="M5.5 8.5h13l-1 11.2a1.6 1.6 0 0 1-1.6 1.3H8.1a1.6 1.6 0 0 1-1.6-1.3l-1-11.2Z"
          fill="currentColor"
          opacity=".92"
        />
        <path
          d="M8.8 8.2V7a3.2 3.2 0 0 1 6.4 0v1.2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        {/* বজ্রচিহ্ন */}
        <path d="M12.6 10.2 9.9 14.1h1.9l-.7 3.4 3-4.1h-1.9l.4-3.2Z" fill="#fbbf24" />
      </svg>
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className={compact ? 'h-9 w-9' : 'h-10 w-10'} />
      <span className="leading-tight">
        <span className="block font-display text-lg font-extrabold tracking-tight text-ink-900 sm:text-xl">
          গ্যাজেট বাজার
        </span>
        {!compact && (
          <span className="block text-[11px] font-medium text-ink-500">বিশ্বস্ত অনলাইন গ্যাজেট শপ</span>
        )}
      </span>
    </span>
  );
}
