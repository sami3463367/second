'use client';

import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useStore } from './store-context';
import { QtyStepper } from './ui';
import { WhatsAppIcon } from './icons';
import { buildSingleProductMessage, waLink } from '@/lib/whatsapp';

export function ProductActions({ product }: { product: Product }) {
  const { addToCart, settings } = useStore();
  const [qty, setQty] = useState(1);
  const max = Math.max(1, product.stock);
  const out = product.stock <= 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-600">পরিমাণ</span>
        <QtyStepper qty={qty} onChange={(n) => setQty(Math.max(1, n))} max={max} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button type="button" disabled={out} onClick={() => addToCart(product, qty)} className="btn-primary py-3.5 text-[15px]">
          <ShoppingCart className="h-5 w-5" />
          কার্টে যোগ করুন
        </button>
        <a
          href={waLink(settings, buildSingleProductMessage(product.name, product.price * qty, settings))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wa py-3.5 text-[15px]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          হোয়াটসঅ্যাপে অর্ডার
        </a>
      </div>
    </div>
  );
}
