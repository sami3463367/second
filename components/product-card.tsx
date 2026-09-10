'use client';

import { ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { bn, bdt } from '@/lib/bangla';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useStore } from './store-context';
import { WhatsAppIcon } from './icons';
import { buildSingleProductMessage, waLink } from '@/lib/whatsapp';

import { discountPercent } from '@/lib/utils';
export { discountPercent };

export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-600">
      <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
      {bn(value.toFixed(1))}
      {count !== undefined && <span className="font-normal text-ink-400">({bn(count)})</span>}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, inCart, settings } = useStore();
  const off = discountPercent(product);
  const inCartQty = inCart(product.id);
  const outOfStock = product.stock <= 0;

  return (
    <article className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-ink-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="badge-soft absolute left-2.5 top-2.5 bg-brand-600 text-white shadow">
            {product.badge}
          </span>
        )}
        {off > 0 && (
          <span className="badge-soft absolute right-2.5 top-2.5 bg-accent-500 text-ink-900 shadow">
            -{bn(off)}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink-900/60 text-sm font-bold text-white">
            স্টক শেষ
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-[15px] font-bold leading-snug text-ink-800 transition hover:text-brand-700">
          {product.name}
        </Link>
        <p className="line-clamp-1 text-[13px] text-ink-500">{product.shortDescription}</p>
        <Rating value={product.rating} count={product.reviewCount} />

        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <div className="leading-tight">
            <div className="font-display text-lg font-extrabold text-ink-900">{bdt(product.price)}</div>
            {product.oldPrice && product.oldPrice > product.price && (
              <div className="text-[13px] font-medium text-ink-400 line-through">{bdt(product.oldPrice)}</div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={waLink(settings, buildSingleProductMessage(product.name, product.price, settings))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost h-10 w-10 !p-0 !text-wa hover:!border-wa hover:!bg-wa hover:!text-white"
              aria-label="হোয়াটসঅ্যাপে অর্ডার"
              title="হোয়াটসঅ্যাপে অর্ডার"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => addToCart(product)}
              className={cn('btn h-10 w-10 !p-0', inCartQty > 0 ? 'bg-emerald-600 text-white' : 'btn-primary !shadow-none')}
              aria-label="কার্টে যোগ করুন"
              title={inCartQty > 0 ? `কার্টে আছে (${inCartQty})` : 'কার্টে যোগ করুন'}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
