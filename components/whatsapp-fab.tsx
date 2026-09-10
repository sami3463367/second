'use client';

import { useStore } from './store-context';
import { WhatsAppIcon } from './icons';
import { buildCartMessage, buildGeneralMessage, waLink } from '@/lib/whatsapp';
import { bdt } from '@/lib/bangla';

/**
 * ভাসমান হোয়াটসঅ্যাপ অর্ডার বাটন।
 * ক্লিক করলে কার্টের সম্পূর্ণ অর্ডার-মেসেজ সরাসরি অ্যাডমিনের হোয়াটসঅ্যাপে চলে যায়।
 */
export function WhatsAppFab() {
  const { cart, totals, settings, pushToast } = useStore();

  const onClick = () => {
    const message =
      cart.length > 0
        ? buildCartMessage(cart, { subtotal: totals.subtotal, deliveryCharge: totals.deliveryCharge, total: totals.total }, settings)
        : buildGeneralMessage(settings);
    const url = waLink(settings, message);
    pushToast('হোয়াটসঅ্যাপে অর্ডার মেসেজ পাঠানো হচ্ছে…', 'info');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-wa fixed bottom-[84px] right-4 z-50 h-14 items-center gap-2.5 rounded-full px-5 text-[15px] font-extrabold shadow-fab md:bottom-6 md:right-6"
      aria-label="হোয়াটসঅ্যাপে অর্ডার করুন"
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse-ring" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </span>
      <span className="whitespace-nowrap">
        {cart.length > 0 ? `অর্ডার করুন • ${bdt(totals.total)}` : 'অর্ডার করুন'}
      </span>
    </button>
  );
}
