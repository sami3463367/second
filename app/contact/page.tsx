'use client';

import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/components/store-context';
import { WhatsAppIcon } from '@/components/icons';
import { waLink } from '@/lib/whatsapp';

export default function ContactPage() {
  const { settings } = useStore();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = [
      `📩 *যোগাযোগ — ${settings.storeName}*`,
      '',
      `নাম: ${form.name}`,
      `মোবাইল: ${form.phone}`,
      '',
      `বার্তা: ${form.message}`,
    ].join('\n');
    window.open(waLink(settings, text), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container-gb max-w-4xl py-10">
      <h1 className="font-display text-3xl font-black text-ink-900">যোগাযোগ করুন</h1>
      <p className="mt-2 text-sm text-ink-500">যেকোনো প্রশ্ন বা অর্ডার সহায়তায় আমরা আছি আপনার পাশে।</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          {[
            { icon: <Phone className="h-5 w-5" />, t: 'ফোন / হটলাইন', d: settings.supportPhone, href: `tel:${settings.supportPhone.replace(/[^\d+]/g, '')}` },
            { icon: <WhatsAppIcon className="h-5 w-5" />, t: 'হোয়াটসঅ্যাপ', d: 'সরাসরি মেসেজ করুন', href: waLink(settings, `আসসালামু আলাইকুম! আমি ${settings.storeName} সম্পর্কে জানতে চাই।`) },
            { icon: <Mail className="h-5 w-5" />, t: 'ইমেইল', d: settings.supportEmail, href: `mailto:${settings.supportEmail}` },
            { icon: <MapPin className="h-5 w-5" />, t: 'ঠিকানা', d: settings.address },
          ].map((c) => (
            <div key={c.t} className="card flex items-center gap-4 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">{c.icon}</span>
              <div className="min-w-0">
                <div className="text-[12px] font-bold uppercase tracking-wide text-ink-400">{c.t}</div>
                {c.href ? (
                  <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block truncate font-semibold text-ink-800 hover:text-brand-700">
                    {c.d}
                  </a>
                ) : (
                  <div className="font-semibold text-ink-800">{c.d}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={send} className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-extrabold text-ink-900">মেসেজ পাঠান</h2>
          <div>
            <label className="label" htmlFor="cname">আপনার নাম</label>
            <input id="cname" className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label" htmlFor="cphone">মোবাইল নম্বর</label>
            <input id="cphone" className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
          </div>
          <div>
            <label className="label" htmlFor="cmsg">আপনার বার্তা</label>
            <textarea id="cmsg" className="input min-h-[110px]" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-wa w-full py-3.5">
            <Send className="h-4 w-4" /> হোয়াটসঅ্যাপে পাঠান
          </button>
          <p className="text-center text-[12px] text-ink-400">মেসেজটি সরাসরি আমাদের হোয়াটসঅ্যাপে পৌঁছে যাবে।</p>
        </form>
      </div>
    </div>
  );
}
