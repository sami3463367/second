'use client';

import { PackageX, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { bn } from '@/lib/bangla';
import type { Category, Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import { discountPercent } from '@/lib/utils';
import { EmptyState } from './ui';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'discount';

const SORT_LABEL: Record<SortKey, string> = {
  newest: 'নতুন আগে',
  'price-asc': 'দাম: কম → বেশি',
  'price-desc': 'দাম: বেশি → কম',
  rating: 'সেরা রেটিং',
  discount: 'সর্বোচ্চ ছাড়',
};

export function ProductBrowser({
  products,
  categories,
  initialQuery,
  initialCategory,
  initialSort,
}: {
  products: Product[];
  categories: Category[];
  initialQuery: string;
  initialCategory: string;
  initialSort: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortKey>((initialSort as SortKey) || 'newest');
  const [inStockOnly, setInStockOnly] = useState(false);

  // URL শেয়ারযোগ্য রাখা (ক্লায়েন্ট-সাইড, রিলোড ছাড়া)
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (sort !== 'newest') params.set('sort', sort);
    const qs = params.toString();
    const url = qs ? `/products?${qs}` : '/products';
    window.history.replaceState(null, '', url);
  }, [query, category, sort]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category) list = list.filter((p) => p.category === category);
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.shortDescription.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term),
      );
    }
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        list.sort((a, b) => discountPercent(b) - discountPercent(a));
        break;
      default:
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  }, [products, category, query, sort, inStockOnly]);

  const activeCat = categories.find((c) => c.slug === category);

  return (
    <div>
      {/* ফিল্টার বার */}
      <div className="card z-30 mb-5 p-3 md:sticky md:top-[104px]">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="এই তালিকায় খুঁজুন…"
              className="input py-2.5 pl-11"
              aria-label="পণ্য খুঁজুন"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="input w-auto shrink-0 py-2.5 text-sm font-semibold"
            aria-label="সাজান"
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
        </div>

        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={cn(
              'chip shrink-0',
              category === '' ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-200 bg-white text-ink-600',
            )}
          >
            সব
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(category === c.slug ? '' : c.slug)}
              className={cn(
                'chip shrink-0',
                category === c.slug
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300',
              )}
            >
              <span>{c.icon}</span>
              {c.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setInStockOnly((v) => !v)}
            className={cn(
              'chip shrink-0',
              inStockOnly ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-ink-200 bg-white text-ink-600',
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            স্টকে আছে
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-lg font-extrabold text-ink-900 sm:text-xl">
          {activeCat ? `${activeCat.icon} ${activeCat.name}` : query ? `"${query}" এর ফলাফল` : 'সব পণ্য'}
        </h1>
        <span className="text-sm font-semibold text-ink-500">{bn(filtered.length)} টি পণ্য</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<PackageX className="h-8 w-8" />}
          title="কোনো পণ্য পাওয়া যায়নি"
          description="অন্য কীওয়ার্ড বা ক্যাটাগরি দিয়ে চেষ্টা করুন।"
          action={
            <button
              type="button"
              className="btn-ghost mt-1 px-5 py-2.5"
              onClick={() => {
                setQuery('');
                setCategory('');
                setInStockOnly(false);
              }}
            >
              ফিল্টার মুছুন
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
