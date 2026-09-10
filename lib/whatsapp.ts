import type { CartItem, Order, Settings } from './types';
import { bdt, bn } from './bangla';
import { normalizePhoneForWa } from './utils';

/**
 * হোয়াটসঅ্যাপ অর্ডার মেসেজ তৈরি ও wa.me লিংক বানানো।
 * অর্ডার বাটনে ক্লিক করলে এই মেসেজটি সরাসরি অ্যাডমিনের হোয়াটসঅ্যাপে চলে যায়।
 */

function line(items: string[]): string {
  return items.join('\n');
}

export function buildCartMessage(items: CartItem[], totals: { subtotal: number; deliveryCharge: number; total: number }, settings: Settings, customer?: Order['customer']): string {
  const parts: string[] = [];
  parts.push(`🛒 *নতুন অর্ডার — ${settings.storeName}*`);
  parts.push('━━━━━━━━━━━━━━━');
  if (customer) {
    parts.push(`👤 নাম: ${customer.name}`);
    parts.push(`📞 মোবাইল: ${customer.phone}`);
    if (customer.email) parts.push(`✉️ ইমেইল: ${customer.email}`);
    parts.push(`📍 ঠিকানা: ${customer.address}`);
    parts.push(`🏙️ জেলা: ${customer.district}${customer.area ? `, ${customer.area}` : ''}`);
    if (customer.note) parts.push(`📝 নোট: ${customer.note}`);
    parts.push('━━━━━━━━━━━━━━━');
  }
  parts.push('*অর্ডারকৃত পণ্য:*');
  items.forEach((it, i) => {
    parts.push(`${bn(i + 1)}. ${it.name}`);
    parts.push(`   ${bn(it.qty)} × ${bdt(it.price)} = ${bdt(it.price * it.qty)}`);
  });
  parts.push('━━━━━━━━━━━━━━━');
  parts.push(`সাবটোটাল: ${bdt(totals.subtotal)}`);
  parts.push(`ডেলিভারি চার্জ: ${totals.deliveryCharge === 0 ? 'ফ্রি 🎉' : bdt(totals.deliveryCharge)}`);
  parts.push(`*সর্বমোট: ${bdt(totals.total)}*`);
  parts.push('💵 পেমেন্ট: *ক্যাশ অন ডেলিভারি*');
  parts.push('');
  parts.push('ধন্যবাদ! অর্ডারটি নিশ্চিত করার অনুরোধ রইল। 🙏');
  return line(parts);
}

export function buildSingleProductMessage(name: string, price: number, settings: Settings): string {
  return line([
    `🛍️ *পণ্য অর্ডার — ${settings.storeName}*`,
    '',
    `পণ্য: ${name}`,
    `দাম: ${bdt(price)}`,
    '💵 পেমেন্ট: ক্যাশ অন ডেলিভারি',
    '',
    'আমি পণ্যটি অর্ডার করতে চাই। বিস্তারিত জানাবেন। 🙏',
  ]);
}

export function buildGeneralMessage(settings: Settings): string {
  return line([
    `আসসালামু আলাইকুম! 👋`,
    `আমি *${settings.storeName}* থেকে গ্যাজেট সম্পর্কে জানতে/অর্ডার করতে চাই।`,
  ]);
}

export function waLink(settings: Settings, message: string): string {
  const number = normalizePhoneForWa(settings.whatsappNumber);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
