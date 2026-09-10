'use client';

import { CheckCircle2, Package, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { bn, bnDateTime, bdt } from '@/lib/bangla';
import type { Order } from '@/lib/types';
import { ORDER_STATUS_LABEL } from '@/lib/types';
import { useStore } from '@/components/store-context';
import { Spinner } from '@/components/ui';
import { WhatsAppIcon } from '@/components/icons';
import { buildCartMessage, waLink } from '@/lib/whatsapp';

export default function OrderSuccessPage() {
  const params = useParams<{ id: string }>();
  const { settings } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/orders/${params.id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setOrder(d?.order ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-gb py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold">অর্ডার পাওয়া যায়নি</h1>
        <Link href="/products" className="btn-primary mt-4 px-6 py-3">পণ্য দেখুন</Link>
      </div>
    );
  }

  const waMessage = buildCartMessage(
    order.items.map((i) => ({ ...i, stock: 0 })),
    { subtotal: order.subtotal, deliveryCharge: order.deliveryCharge, total: order.total },
    settings,
    order.customer,
  );

  return (
    <div className="container-gb max-w-2xl py-8">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-8 text-center text-white">
          <CheckCircle2 className="mx-auto h-14 w-14" />
          <h1 className="mt-3 font-display text-2xl font-black">অর্ডার সফল হয়েছে! 🎉</h1>
          <p className="mt-1 text-[14px] text-emerald-50">
            অর্ডার আইডি: <strong className="font-extrabold">{order.id}</strong>
          </p>
        </div>

        <div className="p-6">
          <div className="rounded-xl bg-accent-50 p-4 text-center">
            <p className="text-[14px] font-semibold text-accent-800">
              📲 এখন নিচের বাটনে ক্লিক করে হোয়াটসঅ্যাপে অর্ডারটি কনফার্ম করুন — মেসেজ সরাসরি আমাদের অ্যাডমিনের কাছে পৌঁছে যাবে।
            </p>
            <a
              href={waLink(settings, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa mt-3 w-full py-4 text-base"
            >
              <WhatsAppIcon className="h-6 w-6" />
              হোয়াটসঅ্যাপে অর্ডার কনফার্ম করুন
            </a>
          </div>

          <dl className="mt-6 space-y-2 text-[14px]">
            <div className="flex justify-between"><dt className="text-ink-500">অর্ডারের সময়</dt><dd className="font-semibold">{bnDateTime(order.createdAt)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">স্ট্যাটাস</dt><dd className="font-semibold">{ORDER_STATUS_LABEL[order.status]}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">পেমেন্ট</dt><dd className="font-semibold">ক্যাশ অন ডেলিভারি 💵</dd></div>
            <div className="flex justify-between"><dt className="text-ink-500">গ্রাহক</dt><dd className="font-semibold">{order.customer.name} ({order.customer.phone})</dd></div>
            <div className="flex justify-between gap-4"><dt className="shrink-0 text-ink-500">ঠিকানা</dt><dd className="text-right font-semibold">{order.customer.address}, {order.customer.district}</dd></div>
          </dl>

          <h2 className="mt-6 flex items-center gap-2 font-display text-base font-extrabold text-ink-900">
            <Package className="h-5 w-5 text-brand-600" /> পণ্যসমূহ
          </h2>
          <ul className="mt-3 space-y-3">
            {order.items.map((it) => (
              <li key={it.productId} className="flex items-center gap-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                  <Image src={it.image} alt={it.name} fill className="object-cover" sizes="56px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-ink-800">{it.name}</span>
                  <span className="block text-[12px] text-ink-500">{bn(it.qty)} × {bdt(it.price)}</span>
                </span>
                <span className="text-[14px] font-bold">{bdt(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-dashed border-ink-200 pt-4 text-[14px]">
            <div className="flex justify-between"><dt className="text-ink-600">সাবটোটাল</dt><dd className="font-semibold">{bdt(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-600">ডেলিভারি চার্জ</dt><dd className="font-semibold">{order.deliveryCharge === 0 ? 'ফ্রি' : bdt(order.deliveryCharge)}</dd></div>
            <div className="flex justify-between text-base"><dt className="font-bold">সর্বমোট</dt><dd className="font-display text-xl font-black text-brand-700">{bdt(order.total)}</dd></div>
          </dl>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/account/orders" className="btn-ghost py-3">
              <Package className="h-5 w-5" /> আমার অর্ডার দেখুন
            </Link>
            <Link href="/products" className="btn-primary py-3">আরও কেনাকাটা করুন</Link>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-center text-[13px] text-ink-500">
            <Phone className="h-4 w-4" /> যেকোনো প্রয়োজনে: {settings.supportPhone}
          </p>
        </div>
      </div>
    </div>
  );
}
