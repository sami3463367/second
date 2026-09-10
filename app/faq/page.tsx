import type { Metadata } from 'next';
import { db } from '@/lib/store';
import { FaqList } from '@/components/faq-list';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'সচরাচর জিজ্ঞাসা',
  description: 'অর্ডার, ডেলিভারি, পেমেন্ট ও রিটার্ন সংক্রান্ত সাধারণ প্রশ্নের উত্তর।',
};

export default async function FaqPage() {
  const store = await db();
  const settings = await store.getSettings();
  return (
    <div className="container-gb max-w-3xl py-10">
      <h1 className="font-display text-3xl font-black text-ink-900">সচরাচর জিজ্ঞাসা</h1>
      <p className="mt-2 text-sm text-ink-500">আপনার প্রশ্নের উত্তর এখানে না পেলে হোয়াটসঅ্যাপে মেসেজ দিন: {settings.supportPhone}</p>
      <FaqList />
    </div>
  );
}
