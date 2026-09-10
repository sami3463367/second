import { BadgeCheck, Banknote, ChevronRight, Home as HomeIcon, RotateCcw, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductActions } from '@/components/product-actions';
import { ProductCard, Rating } from '@/components/product-card';
import { discountPercent } from '@/lib/utils';
import { SectionTitle } from '@/components/ui';
import { bn, bdt } from '@/lib/bangla';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const store = await db();
  const product = await store.getProductBySlug(slug);
  if (!product) return { title: 'পণ্য পাওয়া যায়নি' };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { images: [{ url: product.image }] },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await db();
  const [product, categories, all] = await Promise.all([
    store.getProductBySlug(slug),
    store.listCategories(),
    store.listProducts(),
  ]);
  if (!product || !product.active) notFound();

  const category = categories.find((c) => c.slug === product.category);
  const off = discountPercent(product);
  const related = all.filter((p) => p.active && p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container-gb py-6">
      {/* ব্রেডক্রাম্ব */}
      <nav className="mb-4 flex items-center gap-1.5 text-[13px] text-ink-500" aria-label="ব্রেডক্রাম্ব">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-brand-700">
          <HomeIcon className="h-3.5 w-3.5" /> হোম
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-brand-700">পণ্য</Link>
        {category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/products?category=${category.slug}`} className="hover:text-brand-700">{category.name}</Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate font-semibold text-ink-700">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* ছবি */}
        <div className="card relative aspect-square overflow-hidden bg-ink-100">
          <Image src={product.image} alt={product.name} fill priority className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          {product.badge && <span className="badge-soft absolute left-3 top-3 bg-brand-600 text-white shadow">{product.badge}</span>}
          {off > 0 && <span className="badge-soft absolute right-3 top-3 bg-accent-500 text-ink-900 shadow">-{bn(off)}%</span>}
        </div>

        {/* তথ্য */}
        <div>
          {category && (
            <Link href={`/products?category=${category.slug}`} className="badge-soft bg-brand-50 text-brand-700 ring-1 ring-brand-200">
              {category.icon} {category.name}
            </Link>
          )}
          <h1 className="mt-3 font-display text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} />
            <span className="text-[13px] text-ink-400">|</span>
            <span className={product.stock > 0 ? 'text-[13px] font-bold text-emerald-600' : 'text-[13px] font-bold text-red-600'}>
              {product.stock > 0 ? `স্টকে আছে (${bn(product.stock)} টি)` : 'স্টক শেষ'}
            </span>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-3xl font-black text-brand-700">{bdt(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="pb-1 text-lg font-semibold text-ink-400 line-through">{bdt(product.oldPrice)}</span>
            )}
            {off > 0 && <span className="badge-soft mb-1.5 bg-emerald-100 text-emerald-700">সাশ্রয় {bdt((product.oldPrice || 0) - product.price)}</span>}
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-ink-600">{product.shortDescription}</p>

          {/* বৈশিষ্ট্য */}
          <ul className="mt-4 space-y-2">
            {product.features.slice(0, 6).map((f) => (
              <li key={f} className="flex items-start gap-2 text-[14px] text-ink-700">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <ProductActions product={product} />
          </div>

          {/* ডেলিভারি তথ্য */}
          <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-ink-50 p-3 text-center">
            {[
              { icon: <Banknote className="h-5 w-5" />, t: 'ক্যাশ অন ডেলিভারি' },
              { icon: <Truck className="h-5 w-5" />, t: '২৪-৪৮ ঘণ্টায় ডেলিভারি' },
              { icon: <RotateCcw className="h-5 w-5" />, t: '৭ দিনের রিটার্ন' },
            ].map((x) => (
              <div key={x.t} className="flex flex-col items-center gap-1 text-[12px] font-semibold text-ink-600">
                <span className="text-brand-600">{x.icon}</span>
                {x.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* বিস্তারিত + স্পেক */}
      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        <section className="card p-6 lg:col-span-3">
          <h2 className="font-display text-lg font-extrabold text-ink-900">পণ্যের বিস্তারিত</h2>
          <p className="mt-3 whitespace-pre-line text-[15px] leading-loose text-ink-600">{product.description}</p>
        </section>
        <section className="card overflow-hidden lg:col-span-2">
          <h2 className="border-b border-ink-100 p-5 font-display text-lg font-extrabold text-ink-900">স্পেসিফিকেশন</h2>
          <table className="w-full text-[14px]">
            <tbody>
              {product.specs.map((s, i) => (
                <tr key={s.label} className={i % 2 === 0 ? 'bg-ink-50/60' : ''}>
                  <th className="w-2/5 px-5 py-3 text-left font-semibold text-ink-500">{s.label}</th>
                  <td className="px-5 py-3 font-medium text-ink-800">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* সম্পর্কিত */}
      {related.length > 0 && (
        <section className="mt-12">
          <SectionTitle title="আপনার পছন্দ হতে পারে" subtitle="একই ক্যাটাগরির আরও পণ্য" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
