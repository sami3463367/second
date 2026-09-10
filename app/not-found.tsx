import { Compass } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-gb flex max-w-md flex-col items-center py-24 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
        <Compass className="h-10 w-10" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-black text-ink-900">পেজটি পাওয়া যায়নি</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        দুঃখিত! আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে বা কখনো ছিল না। নিচের বাটন থেকে হোমে ফিরে যান।
      </p>
      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        <Link href="/" className="btn-primary py-3">হোমে যান</Link>
        <Link href="/products" className="btn-ghost py-3">পণ্য দেখুন</Link>
      </div>
    </div>
  );
}
