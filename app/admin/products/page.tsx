'use client';

import { Pencil, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { bn, bdt } from '@/lib/bangla';
import type { Category, Product } from '@/lib/types';
import { cn, slugify } from '@/lib/utils';
import { Spinner } from '@/components/ui';

const AVAILABLE_IMAGES = [
  '/products/smartwatch.jpg',
  '/products/earbuds.jpg',
  '/products/speaker.jpg',
  '/products/powerbank.jpg',
  '/products/headphone.jpg',
  '/products/fitness-band.jpg',
  '/products/wireless-charger.jpg',
  '/products/gaming-mouse.jpg',
  '/products/mech-keyboard.jpg',
  '/products/action-camera.jpg',
  '/products/cctv-camera.jpg',
  '/products/ring-light.jpg',
  '/products/neckband.jpg',
  '/products/tablet.jpg',
  '/products/drone.jpg',
  '/products/usb-hub.jpg',
  '/products/smartphone.jpg',
  '/products/smart-bulb.jpg',
];

interface FormState {
  id: string | null;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  stock: string;
  image: string;
  badge: string;
  featured: boolean;
  active: boolean;
  shortDescription: string;
  description: string;
  features: string;
  specs: string;
}

const EMPTY: FormState = {
  id: null,
  name: '',
  category: '',
  price: '',
  oldPrice: '',
  stock: '10',
  image: AVAILABLE_IMAGES[0],
  badge: '',
  featured: false,
  active: true,
  shortDescription: '',
  description: '',
  features: '',
  specs: '',
};

function toForm(p: Product): FormState {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: String(p.price),
    oldPrice: p.oldPrice ? String(p.oldPrice) : '',
    stock: String(p.stock),
    image: p.image,
    badge: p.badge || '',
    featured: p.featured,
    active: p.active,
    shortDescription: p.shortDescription,
    description: p.description,
    features: p.features.join('\n'),
    specs: p.specs.map((s) => `${s.label}: ${s.value}`).join('\n'),
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    Promise.all([
      fetch('/api/admin/products', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/products', { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([a, b]) => {
        setProducts(a?.products ?? []);
        setCategories(b?.categories ?? []);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError('');
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      stock: Number(form.stock),
      image: form.image,
      badge: form.badge || null,
      featured: form.featured,
      active: form.active,
      shortDescription: form.shortDescription,
      description: form.description,
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
      specs: form.specs
        .split('\n')
        .map((line) => {
          const idx = line.indexOf(':');
          if (idx === -1) return null;
          return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
        })
        .filter((x): x is { label: string; value: string } => Boolean(x)),
    };
    try {
      const url = form.id ? `/api/admin/products/${form.id}` : '/api/admin/products';
      const res = await fetch(url, {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'সংরক্ষণ ব্যর্থ');
      } else {
        setForm(null);
        load();
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা');
    }
    setSaving(false);
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`"${p.name}" ডিলিট করবেন? এটি ফিরিয়ে আনা যাবে না।`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    load();
  };

  const toggle = async (p: Product, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, ...patch } : x)));
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-500">{bn(products.length)} টি পণ্য</p>
        <button type="button" onClick={() => { setForm({ ...EMPTY, category: categories[0]?.slug || '' }); setError(''); }} className="btn-primary px-4 py-2.5 text-sm">
          <Plus className="h-4 w-4" /> নতুন পণ্য
        </button>
      </div>

      <div className="space-y-2.5">
        {products.map((p) => (
          <div key={p.id} className="card flex items-center gap-3 p-3">
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
              <Image src={p.image} alt={p.name} fill className="object-cover" sizes="64px" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-bold text-ink-800">{p.name}</span>
                {p.featured && <span className="badge-soft bg-brand-100 text-brand-700">ফিচার্ড</span>}
                {!p.active && <span className="badge-soft bg-ink-200 text-ink-600">নিষ্ক্রিয়</span>}
                {p.stock <= 5 && <span className="badge-soft bg-red-100 text-red-700">কম স্টক ({bn(p.stock)})</span>}
              </div>
              <div className="mt-0.5 text-[13px] text-ink-500">
                {bdt(p.price)} • স্টক {bn(p.stock)} • {categories.find((c) => c.slug === p.category)?.name || p.category}
              </div>
            </div>
            <label className="hidden items-center gap-2 text-[13px] font-semibold text-ink-600 sm:flex">
              <input type="checkbox" checked={p.active} onChange={(e) => toggle(p, { active: e.target.checked })} className="h-4 w-4 accent-brand-600" />
              সক্রিয়
            </label>
            <button type="button" onClick={() => { setForm(toForm(p)); setError(''); }} className="btn-ghost h-10 w-10 !p-0" aria-label="সম্পাদনা">
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => remove(p)} className="btn-ghost h-10 w-10 !p-0 !text-red-600 hover:!border-red-300 hover:!bg-red-50" aria-label="ডিলিট">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* মডাল ফর্ম */}
      {form && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[92vh] w-full max-w-2xl animate-sheet-up overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4">
              <h2 className="font-display text-lg font-extrabold text-ink-900">{form.id ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ করুন'}</h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100" aria-label="বন্ধ">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={save} className="space-y-4 p-6">
              <div>
                <label className="label">পণ্যের নাম *</label>
                <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">ক্যাটাগরি *</label>
                  <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)} required>
                    <option value="">নির্বাচন করুন</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">ব্যাজ (ঐচ্ছিক)</label>
                  <input className="input" value={form.badge} onChange={(e) => set('badge', e.target.value)} placeholder="যেমন: বেস্ট সেলার" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">দাম (৳) *</label>
                  <input className="input" type="number" min={1} value={form.price} onChange={(e) => set('price', e.target.value)} required />
                </div>
                <div>
                  <label className="label">আগের দাম</label>
                  <input className="input" type="number" min={0} value={form.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} placeholder="ছাড় দেখাতে" />
                </div>
                <div>
                  <label className="label">স্টক</label>
                  <input className="input" type="number" min={0} value={form.stock} onChange={(e) => set('stock', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">ছবি</label>
                <input className="input" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="/products/….jpg বা URL" />
                <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                  {AVAILABLE_IMAGES.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => set('image', img)}
                      className={cn('relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition', form.image === img ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100')}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">সংক্ষিপ্ত বিবরণ</label>
                <input className="input" value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} />
              </div>
              <div>
                <label className="label">বিস্তারিত বিবরণ</label>
                <textarea className="input min-h-[90px]" value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div>
                <label className="label">বৈশিষ্ট্য (প্রতি লাইনে একটি)</label>
                <textarea className="input min-h-[80px]" value={form.features} onChange={(e) => set('features', e.target.value)} placeholder={'লাইন ১\nলাইন ২'} />
              </div>
              <div>
                <label className="label">স্পেসিফিকেশন (প্রতি লাইনে "লেবেল: মান")</label>
                <textarea className="input min-h-[80px]" value={form.specs} onChange={(e) => set('specs', e.target.value)} placeholder={'ব্যাটারি: ৫০০০ mAh\nওয়ারেন্টি: ৬ মাস'} />
              </div>

              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                  <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 accent-brand-600" />
                  ফিচার্ড করুন
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                  <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 accent-brand-600" />
                  সক্রিয় (সাইটে দেখাবে)
                </label>
              </div>

              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setForm(null)} className="btn-ghost flex-1 py-3">বাতিল</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
                  {saving ? <Spinner /> : null} {form.id ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
              <p className="text-center text-[11px] text-ink-400">স্লাগ স্বয়ংক্রিয়: {slugify(form.name) || '—'}</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
