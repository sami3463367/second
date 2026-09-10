import { BadgeCheck, Banknote, Heart, Target, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে',
  description: 'গ্যাজেট বাজারের গল্প, লক্ষ্য ও প্রতিশ্রুতি জানুন।',
};

export default async function AboutPage() {
  const store = await db();
  const settings = await store.getSettings();

  return (
    <div className="container-gb max-w-3xl py-10">
      <h1 className="font-display text-3xl font-black text-ink-900">আমাদের সম্পর্কে</h1>
      <p className="mt-4 text-[15px] leading-loose text-ink-600">
        <strong>{settings.storeName}</strong> বাংলাদেশের একটি বিশ্বস্ত অনলাইন গ্যাজেট শপ। আমরা বিশ্বাস করি প্রযুক্তি সবার জন্য সহজলভ্য হওয়া উচিত — তাই সেরা মানের অরিজিনাল গ্যাজেট আমরা পৌঁছে দিই একদম সাশ্রয়ী দামে, দেশের ৬৪ জেলার যেকোনো প্রান্তে।
      </p>
      <p className="mt-3 text-[15px] leading-loose text-ink-600">
        স্মার্টওয়াচ থেকে শুরু করে স্মার্ট হোম ডিভাইস — প্রতিটি পণ্য আমরা নিজে যাচাই করে তবেই তালিকাভুক্ত করি। কোনো পণ্য নকল প্রমাণিত হলে আমরা সম্পূর্ণ টাকা ফেরত দিই, কোনো প্রশ্ন ছাড়াই।
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: <Target className="h-6 w-6" />, t: 'আমাদের লক্ষ্য', d: 'প্রতিটি বাংলাদেশির হাতে সাশ্রয়ী দামে অরিজিনাল প্রযুক্তি পৌঁছে দেওয়া।' },
          { icon: <BadgeCheck className="h-6 w-6" />, t: 'আমাদের প্রতিশ্রুতি', d: '১০০% অরিজিনাল পণ্য, স্বচ্ছ দাম আর আন্তরিক সেবা।' },
          { icon: <Heart className="h-6 w-6" />, t: 'আমাদের ভালোবাসা', d: 'কাস্টমারের বিশ্বাসই আমাদের সবচেয়ে বড় পাওয়া।' },
        ].map((x) => (
          <div key={x.t} className="card p-5 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">{x.icon}</span>
            <h2 className="mt-3 font-display text-base font-extrabold text-ink-900">{x.t}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{x.d}</p>
          </div>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-display text-lg font-extrabold text-ink-900">কেন আমরা আলাদা?</h2>
        <ul className="mt-4 space-y-3 text-[14px] text-ink-600">
          <li className="flex items-start gap-2.5"><Banknote className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন, কোনো অগ্রিম পেমেন্ট নেই।</li>
          <li className="flex items-start gap-2.5"><Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /> ঢাকায় ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে ২-৪ দিনে ডেলিভারি।</li>
          <li className="flex items-start gap-2.5"><BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" /> ৭ দিনের সহজ রিটার্ন ও বদলি সুবিধা।</li>
        </ul>
      </div>
    </div>
  );
}
