import { Facebook, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/store';
import { CodIcon, WhatsAppIcon } from './icons';
import { LogoMark } from './logo';

export async function Footer() {
  const store = await db();
  const [settings, categories] = await Promise.all([store.getSettings(), store.listCategories()]);

  return (
    <footer className="mt-16 bg-ink-950 pb-28 pt-12 text-ink-300 md:pb-12">
      <div className="container-gb">
        <div className="grid gap-10 md:grid-cols-4">
          {/* ব্র্যান্ড */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoMark className="h-10 w-10" />
              <span className="font-display text-xl font-extrabold text-white">{settings.storeName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-400">
              {settings.tagline}। আমরা সারাদেশে ক্যাশ অন ডেলিভারিতে অরিজিনাল গ্যাজেট পৌঁছে দিই — দ্রুত, নিরাপদ ও সাশ্রয়ী দামে।
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/5 p-2.5 transition hover:bg-white/10 hover:text-white"
                aria-label="ফেসবুক"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white/5 p-2.5 transition hover:bg-white/10 hover:text-white"
                aria-label="ইউটিউব"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-wa/15 p-2.5 text-wa transition hover:bg-wa hover:text-white"
                aria-label="হোয়াটসঅ্যাপ"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* ক্যাটাগরি */}
          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">ক্যাটাগরি</h3>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 7).map((c) => (
                <li key={c.slug}>
                  <Link href={`/products?category=${c.slug}`} className="transition hover:text-white">
                    {c.icon} {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* লিংক */}
          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">দরকারি লিংক</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="transition hover:text-white">সব পণ্য</Link></li>
              <li><Link href="/about" className="transition hover:text-white">আমাদের সম্পর্কে</Link></li>
              <li><Link href="/faq" className="transition hover:text-white">সচরাচর জিজ্ঞাসা</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">যোগাযোগ</Link></li>
              <li><Link href="/account/orders" className="transition hover:text-white">আমার অর্ডার</Link></li>
              <li><Link href="/admin" className="transition hover:text-white">অ্যাডমিন প্যানেল</Link></li>
            </ul>
          </div>

          {/* যোগাযোগ */}
          <div>
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-white">যোগাযোগ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-5 w-5 shrink-0 text-brand-400" />
                <a href={`tel:${settings.supportPhone.replace(/[^\d+]/g, '')}`} className="transition hover:text-white">
                  {settings.supportPhone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-5 w-5 shrink-0 text-brand-400" />
                <a href={`mailto:${settings.supportEmail}`} className="transition hover:text-white">
                  {settings.supportEmail}
                </a>
              </li>
            </ul>
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-wa/30 bg-wa/10 px-3.5 py-2.5 text-sm font-semibold text-wa">
              <CodIcon className="h-5 w-5" />
              সারাদেশে ক্যাশ অন ডেলিভারি
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-[13px] text-ink-500">
          © {new Date().getFullYear()} {settings.storeName} — সর্বস্বত্ব সংরক্ষিত। বাংলাদেশে 💚 দিয়ে তৈরি।
        </div>
      </div>
    </footer>
  );
}
