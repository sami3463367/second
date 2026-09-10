/**
 * সাইট-ওয়াইড কনফিগারেশন।
 * সব কিছু এনভায়রনমেন্ট ভ্যারিয়েবল ছাড়াই চলবে — Vercel-এ কোনো env সেট না করলেও
 * সাইট সম্পূর্ণ কাজ করবে। env দিলে শুধু ওভাররাইড হবে।
 */

export const SITE = {
  name: 'গ্যাজেট বাজার',
  nameEn: 'Gadget Bazar',
  tagline: 'বাংলাদেশের বিশ্বস্ত অনলাইন গ্যাজেট শপ',
  description:
    'গ্যাজেট বাজার — বাংলাদেশের সেরা দামে অরিজিনাল ইলেকট্রনিক গ্যাজেট। স্মার্টওয়াচ, ইয়ারবাডস, স্পিকার, পাওয়ার ব্যাংক ও আরও অনেক কিছু। ক্যাশ অন ডেলিভারিতে সারাদেশে ডেলিভারি।',
  url: process.env.NEXT_PUBLIC_SITE_URL || '',
  locale: 'bn_BD',
  currency: 'BDT',
} as const;

/** স্টোরের ডিফল্ট সেটিংস (ডাটাবেস/স্টোর না থাকলে এগুলোই ব্যবহৃত হয়) */
export const DEFAULT_SETTINGS = {
  storeName: SITE.name,
  tagline: SITE.tagline,
  announcement:
    '🎉 ঢাকার ভিতরে ডেলিভারি চার্জ মাত্র ৳৬ | ৳,০০+ অর্ডারে ফ্রি ডেলিভারি | সারাদেশে ক্যাশ অন ডেলিভারি',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801712345678',
  supportPhone: '+৮৮ ১৭১২-৩৪৫৬৭৮',
  supportEmail: 'support@gadgetbazar.com.bd',
  address: 'লেভেল ৪, বসুন্ধরা সিটি, পান্থপথ, ঢাকা ১২০',
  deliveryCharge: 60,
  deliveryChargeOutside: 120,
  freeDeliveryOver: 5000,
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
} as const;

/** ডিফল্ট অ্যাডমিন লগইন (প্রথম লগইনের পর পাসওয়ার্ড বদলে নেওয়ার পরামর্শ দেওয়া হয়) */
export const DEFAULT_ADMIN = {
  name: 'অ্যাডমিন',
  email: 'admin@gadgetbazar.com',
  password: 'admin123',
} as const;

/** JWT সিক্রেট — env না দিলে ডিভলপমেন্ট ফলব্যাক (অ্যাডমিন প্যানেলে সতর্কবার্তা দেখায়) */
export function getAuthSecret(): string {
  return process.env.AUTH_SECRET || 'gadget-bazar-insecure-dev-secret-please-set-AUTH_SECRET';
}

export function isAuthSecretConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET);
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

/** বাংলাদেশের জেলাসমূহ (ডেলিভারির জন্য) */
export const DISTRICTS = [
  'ঢাকা',
  'চট্টগ্রাম',
  'সিলেট',
  'খুলনা',
  'রাজশাহী',
  'বরিশাল',
  'রংপুর',
  'ময়মনসিংহ',
  'কুমিল্লা',
  'গাজীপুর',
  'নারায়ণগঞ্জ',
  'টাঙ্গাইল',
  'কিশোরগঞ্জ',
  'নরসিংদী',
  'মানিকগঞ্জ',
  'মুন্সিগঞ্জ',
  'ফরিদপুর',
  'গোপালগঞ্জ',
  'মাদারীপুর',
  'শরীয়তপুর',
  'রাজবাড়ী',
  'কক্সবাজার',
  'ফেনী',
  'ব্রাহ্মণবাড়িয়া',
  'চাঁদপুর',
  'লক্ষ্মীপুর',
  'নোয়াখালী',
  'হবিগঞ্জ',
  'মৌলভীবাজার',
  'সুনামগঞ্জ',
  'যশোর',
  'ঝিনাইদহ',
  'মাগুরা',
  'মেহেরপুর',
  'নড়াইল',
  'সাতক্ষীরা',
  'বাগেরহাট',
  'কুষ্টিয়া',
  'চুয়াডাঙ্গা',
  'বগুড়া',
  'জয়পুরহাট',
  'নওগাঁ',
  'নাটোর',
  'চাঁপাইনবাবগঞ্জ',
  'পাবনা',
  'সিরাজগঞ্জ',
  'দিনাজপুর',
  'গাইবান্ধা',
  'কুড়িগ্রাম',
  'লালমনিরহাট',
  'নীলফামারী',
  'পঞ্চগড়',
  'ঠাকুরগাঁও',
  'জামালপুর',
  'নেত্রকোনা',
  'শেরপুর',
  'পটুয়াখালী',
  'বরগুনা',
  'ভোলা',
  'পিরোজপুর',
  'ঝালকাঠি',
] as const;
