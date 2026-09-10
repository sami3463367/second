'use client';

import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { bn, bdt } from '@/lib/bangla';
import { DISTRICTS } from '@/lib/config';
import { useStore } from '@/components/store-context';
import { EmptyState, QtyStepper, SectionTitle } from '@/components/ui';
import { WhatsAppIcon } from '@/components/icons';
import { buildCartMessage, waLink } from '@/lib/whatsapp';

export default function CartPage() {
  const { cart, setQty, removeFromCart, clearCartAll, totals, settings, district, setDistrict } = useStore();

  if (cart.length === 0) {
    return (
      <div className="container-gb py-10">
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="আপনার কার্ট খালি"
          description="পছন্দের গ্যাজেট কার্টে যোগ করে অর্ডার শুরু করুন।"
          action={
            <Link href="/products" className="btn-primary mt-1 px-6 py-3">
              কেনাকাটা শুরু করুন <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-gb py-6">
      <SectionTitle
        title="আপনার কার্ট"
        subtitle={`${bn(totals.itemCount)} টি পণ্য`}
        action={
          <button type="button" onClick={clearCartAll} className="btn-ghost px-4 py-2 text-sm !text-red-600 hover:!border-red-300">
            <Trash2 className="h-4 w-4" /> সব মুছুন
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* আইটেম */}
        <div className="space-y-3 lg:col-span-2">
          {cart.map((item) => (
            <div key={item.productId} className="card flex gap-3.5 p-3.5">
              <Link href={`/products/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:h-28 sm:w-28">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${item.slug}`} className="line-clamp-2 text-[15px] font-bold text-ink-800 hover:text-brand-700">
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="shrink-0 rounded-lg p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="মুছে ফেলুন"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-0.5 text-[13px] text-ink-500">একক দাম: {bdt(item.price)}</div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <QtyStepper qty={item.qty} onChange={(n) => setQty(item.productId, n)} max={Math.max(1, item.stock)} size="sm" />
                  <div className="font-display text-lg font-extrabold text-ink-900">{bdt(item.price * item.qty)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* সারাংশ */}
        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-extrabold text-ink-900">অর্ডার সারাংশ</h2>

          <label className="label mt-4" htmlFor="district">ডেলিভারি এলাকা</label>
          <select id="district" className="input" value={district} onChange={(e) => setDistrict(e.target.value)}>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <dl className="mt-4 space-y-2.5 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-ink-600">সাবটোটাল</dt>
              <dd className="font-semibold">{bdt(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-600">ডেলিভারি চার্জ</dt>
              <dd className="font-semibold">
                {totals.deliveryCharge === 0 ? <span className="text-emerald-600">ফ্রি 🎉</span> : bdt(totals.deliveryCharge)}
              </dd>
            </div>
            {totals.freeDelivery && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[13px] font-semibold text-emerald-700">
                অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন।
              </p>
            )}
            {!totals.freeDelivery && totals.remainingForFree > 0 && (
              <p className="rounded-lg bg-accent-50 px-3 py-2 text-[13px] font-semibold text-accent-700">
                আর {bdt(totals.remainingForFree)} যোগ করলে ফ্রি ডেলিভারি!
              </p>
            )}
            <div className="flex justify-between border-t border-dashed border-ink-200 pt-3 text-base">
              <dt className="font-bold">সর্বমোট</dt>
              <dd className="font-display text-xl font-black text-brand-700">{bdt(totals.total)}</dd>
            </div>
          </dl>

          <Link href="/checkout" className="btn-primary mt-5 w-full py-3.5 text-[15px]">
            চেকআউট করুন <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={waLink(settings, buildCartMessage(cart, { subtotal: totals.subtotal, deliveryCharge: totals.deliveryCharge, total: totals.total }, settings))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa mt-2.5 w-full py-3.5 text-[15px]"
          >
            <WhatsAppIcon className="h-5 w-5" /> হোয়াটসঅ্যাপে অর্ডার
          </a>
          <p className="mt-3 text-center text-[12px] text-ink-500">💵 পেমেন্ট: ক্যাশ অন ডেলিভারি</p>
        </aside>
      </div>
    </div>
  );
}
