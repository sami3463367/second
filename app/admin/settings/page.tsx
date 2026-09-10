'use client';

import { Database, KeyRound, Save, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Settings } from '@/lib/types';
import { useStore } from '@/components/store-context';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

interface EnvInfo {
  databaseConfigured: boolean;
  authSecretConfigured: boolean;
  storeKind: string;
}

export default function AdminSettingsPage() {
  const { pushToast } = useStore();
  const [form, setForm] = useState<Settings | null>(null);
  const [env, setEnv] = useState<EnvInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        setForm(d?.settings ?? null);
        setEnv(d?.env ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) pushToast('সেটিংস সংরক্ষিত হয়েছে ✅', 'success');
      else pushToast(data?.error || 'সংরক্ষণ ব্যর্থ', 'error');
    } catch {
      pushToast('নেটওয়ার্ক সমস্যা', 'error');
    }
    setSaving(false);
  };

  if (loading || !form) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const num = (v: string) => (v === '' ? 0 : Number(v));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={save} className="card space-y-4 p-6 lg:col-span-2">
        <h2 className="font-display text-lg font-extrabold text-ink-900">স্টোর সেটিংস</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">স্টোরের নাম</label>
            <input className="input" value={form.storeName} onChange={(e) => set('storeName', e.target.value)} />
          </div>
          <div>
            <label className="label">ট্যাগলাইন</label>
            <input className="input" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">ঘোষণা বারের টেক্সট</label>
          <input className="input" value={form.announcement} onChange={(e) => set('announcement', e.target.value)} />
        </div>

        <div className="rounded-xl border border-wa/30 bg-wa/5 p-4">
          <h3 className="mb-3 text-sm font-extrabold text-wa-deep">📲 হোয়াটসঅ্যাপ অর্ডার নম্বর</h3>
          <label className="label">নম্বর (দেশের কোডসহ, + ছাড়া)</label>
          <input
            className="input"
            value={form.whatsappNumber}
            onChange={(e) => set('whatsappNumber', e.target.value)}
            placeholder="8801XXXXXXXXX"
          />
          <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
            ভাসমান হোয়াটসঅ্যাপ বাটনে ক্লিক করলে অর্ডার মেসেজ এই নম্বরে যাবে। বাংলাদেশের নম্বরের জন্য <code className="rounded bg-white px-1">880</code> দিয়ে শুরু করুন, যেমন <code className="rounded bg-white px-1">8801712345678</code>।
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">সাপোর্ট ফোন</label>
            <input className="input" value={form.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} />
          </div>
          <div>
            <label className="label">সাপোর্ট ইমেইল</label>
            <input className="input" value={form.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">ঠিকানা</label>
          <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">ঢাকার ভিতরে ডেলিভারি (৳)</label>
            <input className="input" type="number" min={0} value={String(form.deliveryCharge)} onChange={(e) => set('deliveryCharge', num(e.target.value))} />
          </div>
          <div>
            <label className="label">ঢাকার বাইরে ডেলিভারি (৳)</label>
            <input className="input" type="number" min={0} value={String(form.deliveryChargeOutside)} onChange={(e) => set('deliveryChargeOutside', num(e.target.value))} />
          </div>
          <div>
            <label className="label">ফ্রি ডেলিভারি (৳+)</label>
            <input className="input" type="number" min={0} value={String(form.freeDeliveryOver)} onChange={(e) => set('freeDeliveryOver', num(e.target.value))} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">ফেসবুক পেজ URL</label>
            <input className="input" value={form.facebookUrl} onChange={(e) => set('facebookUrl', e.target.value)} />
          </div>
          <div>
            <label className="label">ইউটিউব URL</label>
            <input className="input" value={form.youtubeUrl} onChange={(e) => set('youtubeUrl', e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5">
          {saving ? <Spinner /> : <Save className="h-5 w-5" />} সংরক্ষণ করুন
        </button>
      </form>

      {/* সিস্টেম স্ট্যাটাস */}
      <aside className="space-y-4">
        <div className="card p-5">
          <h2 className="mb-3 font-display text-base font-extrabold text-ink-900">সিস্টেম স্ট্যাটাস</h2>
          <ul className="space-y-3 text-[13px]">
            <li className="flex items-start gap-2.5">
              <Database className={cn('mt-0.5 h-5 w-5 shrink-0', env?.databaseConfigured ? 'text-emerald-600' : 'text-accent-600')} />
              <span>
                <strong>ডাটাবেস:</strong>{' '}
                {env?.databaseConfigured ? 'Postgres সংযুক্ত ✅' : 'ডেমো (ইন-মেমরি) মোড — স্থায়ী ডেটার জন্য DATABASE_URL যোগ করুন'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <KeyRound className={cn('mt-0.5 h-5 w-5 shrink-0', env?.authSecretConfigured ? 'text-emerald-600' : 'text-accent-600')} />
              <span>
                <strong>সেশন সিক্রেট:</strong>{' '}
                {env?.authSecretConfigured ? 'কনফিগার করা ✅' : 'ডিফল্ট — নিরাপত্তার জন্য AUTH_SECRET সেট করুন'}
              </span>
            </li>
          </ul>
        </div>

        {!env?.authSecretConfigured && (
          <div className="flex items-start gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4 text-[13px] leading-relaxed text-accent-800">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              প্রোডাকশনে যাওয়ার আগে Vercel → Settings → Environment Variables-এ <code className="rounded bg-white/60 px-1">AUTH_SECRET</code> (যেকোনো লম্বা র‍্যান্ডম স্ট্রিং) এবং প্রয়োজনে <code className="rounded bg-white/60 px-1">DATABASE_URL</code> যোগ করুন। এরপর Deploy → Redeploy করলেই হবে।
            </p>
          </div>
        )}

        <div className="card p-5 text-[13px] leading-relaxed text-ink-600">
          <h2 className="mb-2 font-display text-base font-extrabold text-ink-900">দ্রুত টিপস</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>প্রথম লগইনের পর অ্যাকাউন্ট পেজ থেকে পাসওয়ার্ড বদলে নিন।</li>
            <li>হোয়াটসঅ্যাপ নম্বর বদলালে সাথে সাথেই কার্যকর হবে।</li>
            <li>ফ্রি ডেলিভারি বন্ধ করতে মান <code className="rounded bg-ink-100 px-1">0</code> দিন।</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
