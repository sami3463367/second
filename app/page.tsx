import { ArrowLeft, BadgeCheck, Banknote, ChevronRight, Headphones, ShieldCheck, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { SectionTitle } from '@/components/ui';
import { WhatsAppIcon } from '@/components/icons';
import { bn } from '@/lib/bangla';
import { db } from '@/lib/store';
import { buildGeneralMessage, waLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const store = await db();
  const [settings, categories, products] = await Promise.all([
    store.getSettings(),
    store.listCategories(),
    store.listProducts(),
  ]);
  const active = products.filter((p) => p.active);
  const featured = active.filter((p) => p.featured).slice(0, 8);
  const latest = active.slice(0, 8);
  const deals = active.filter((p) => p.oldPrice && p.oldPrice > p.price).slice(0, 4);

  return (
    <div>
      {/* ------------------------------ হিরো ------------------------------ */}
      <section className="relative overflow-hidden bg-ink-950">
        <Image
          src="/hero/hero-gadgets.jpg"
          alt="গ্যাজেট কালেকশন"
          fill
          priority
          className="object-cover object-right opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/20" />
        <div className="container-gb relative py-14 sm:py-20">
          <div className="max-w-xl animate-fade-up">
            <span className="badge-soft bg-wa/15 text-wa ring-1 ring-wa/30">
              <Banknote className="h-3.5 w-3.5" />
              ক্যাশ অন ডেলিভারি — সারাদেশে
            </span>
            <h1 className="mt-4 font-display text-3xl font-black leading-tight text-white sm:text-5xl">
              আপনার পছন্দের <span className="text-accent-400">গ্যাজেট</span>,<br />
              এখন এক ক্লিকেই আপনার দরজায়
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-300 sm:text-base">
              {settings.tagline}। ১০০% অরিজিনাল পণ্য, সাশ্রয়ী দাম আর দ্রুত ডেলিভারি — সবকিছু এক জায়গায়।
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/products" className="btn-accent px-6 py-3.5 text-[15px]">
                কেনাকাটা শুরু করুন
                <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href={waLink(settings, buildGeneralMessage(settings))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa px-6 py-3.5 text-[15px]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                হোয়াটসঅ্যাপে অর্ডার
              </a>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center">
              {[
                { n: `${bn(active.length)}+`, l: 'পণ্য' },
                { n: `${bn(5000)}+`, l: 'সন্তুষ্ট কাস্টমার' },
                { n: `${bn(64)}`, l: 'জেলায় ডেলিভারি' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-white/5 px-2 py-3 ring-1 ring-white/10 backdrop-blur">
                  <div className="font-display text-xl font-extrabold text-white">{s.n}</div>
                  <div className="text-[12px] text-ink-400">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ সুবিধা ------------------------------ */}
      <section className="container-gb -mt-0 py-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: <Banknote className="h-6 w-6" />, t: 'ক্যাশ অন ডেলিভারি', d: 'পণ্য হাতে পেয়ে টাকা দিন' },
            { icon: <Truck className="h-6 w-6" />, t: 'দ্রুত ডেলিভারি', d: 'ঢাকায় ২৪-৪৮ ঘণ্টা' },
            { icon: <ShieldCheck className="h-6 w-6" />, t: 'অরিজিনাল পণ্য', d: '১০০% গ্যারান্টি সহ' },
            { icon: <Headphones className="h-6 w-6" />, t: 'সাপোর্ট', d: 'সকাল ৯টা – রাত ১০টা' },
          ].map((f) => (
            <div key={f.t} className="card flex items-center gap-3 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                {f.icon}
              </span>
              <span>
                <span className="block text-[14px] font-bold text-ink-800">{f.t}</span>
                <span className="block text-[12px] text-ink-500">{f.d}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ ক্যাটাগরি ------------------------------ */}
      <section className="container-gb py-4">
        <SectionTitle title="ক্যাটাগরি অনুযায়ী কিনুন" subtitle="আপনার প্রয়োজন অনুযায়ী বেছে নিন" />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 md:grid-cols-7">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="card flex min-w-[112px] flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift sm:min-w-0"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-2xl">
                {c.icon}
              </span>
              <span className="text-[13px] font-bold leading-tight text-ink-800">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------ ডিল ------------------------------ */}
      {deals.length > 0 && (
        <section className="container-gb py-8">
          <div className="card overflow-hidden !border-accent-200 bg-gradient-to-br from-accent-50 to-white p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="badge-soft bg-accent-500 text-ink-900">🔥 আজকের ডিল</span>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-ink-900">
                  বিশাল ছাড় — সীমিত সময়ের জন্য!
                </h2>
                <p className="mt-1 text-sm text-ink-600">
                  নির্বাচিত পণ্যে {bn(40)}% পর্যন্ত ছাড়। স্টক শেষ হওয়ার আগেই অর্ডার করুন।
                </p>
              </div>
              <Link href="/products?sort=discount" className="btn-primary px-5 py-3">
                সব ডিল দেখুন
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------ ফিচার্ড ------------------------------ */}
      <section className="container-gb py-8">
        <SectionTitle
          title="ফিচার্ড পণ্যসমূহ"
          subtitle="সবচেয়ে জনপ্রিয় ও বিশ্বস্ত পণ্য"
          action={
            <Link href="/products" className="hidden items-center gap-1 text-sm font-bold text-brand-700 hover:underline sm:inline-flex">
              সব দেখুন <ChevronRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ------------------------------ ট্রাস্ট ব্যানার ------------------------------ */}
      <section className="container-gb py-4">
        <div className="card grid gap-6 overflow-hidden bg-ink-950 p-7 text-white sm:grid-cols-3 sm:p-9">
          {[
            { icon: <BadgeCheck className="h-7 w-7" />, t: '১০০% অরিজিনাল', d: 'প্রতিটি পণ্য যাচাই করা। নকল প্রমাণিত হলে সম্পূর্ণ টাকা ফেরত।' },
            { icon: <Truck className="h-7 w-7" />, t: 'সারাদেশে ডেলিভারি', d: '৬৪ জেলায় হোম ডেলিভারি। ঢাকার বাইরে ২-৪ দিন।' },
            { icon: <ShieldCheck className="h-7 w-7" />, t: 'সহজ রিটার্ন', d: '৭ দিনের মধ্যে ডেফেক্ট হলে সহজেই বদলে নিন।' },
          ].map((x) => (
            <div key={x.t} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-400">
                {x.icon}
              </span>
              <span>
                <span className="block font-display text-lg font-bold">{x.t}</span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-400">{x.d}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ নতুন ------------------------------ */}
      <section className="container-gb py-8">
        <SectionTitle title="নতুন এসেছে" subtitle="সদ্য যুক্ত হওয়া পণ্যসমূহ" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
