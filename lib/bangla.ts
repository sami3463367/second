/**
 * বাংলা সংখ্যা ও তারিখ ফরম্যাটিং ইউটিলিটি
 * (Bangla digit & date formatting helpers)
 */

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর — e.g. 1234 -> ১২৩৪ */
export function bn(input: number | string): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/** বাংলা সংখ্যাকে ইংরেজি সংখ্যায় রূপান্তর — e.g. ১২৩৪ -> 1234 */
export function fromBn(input: string): string {
  const map: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };
  return String(input).replace(/[০-৯]/g, (d) => map[d]);
}

/**
 * সংখ্যায় ভারতীয়/বাংলাদেশি গ্রুপিং সহ কমা — e.g. 1234567 -> 12,34,567
 */
export function groupNumber(n: number): string {
  const neg = n < 0;
  let s = Math.abs(Math.round(n)).toString();
  if (s.length > 3) {
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    s = `${rest},${last3}`;
  }
  return (neg ? '-' : '') + s;
}

/** টাকা ফরম্যাট — e.g. 3490 -> ৳৩,৪৯০ */
export function bdt(amount: number): string {
  return `৳${bn(groupNumber(amount))}`;
}

const BN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BN_WEEKDAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

/** তারিখকে বাংলায় ফরম্যাট — e.g. ১০ সেপ্টেম্বর ২০২৬ */
export function bnDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '';
  return `${bn(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${bn(d.getFullYear())}`;
}

/** তারিখ + সময় বাংলায় — e.g. ১০ সেপ্টেম্বর ২০২৬, ৩:২৫ অপরাহ্ণ */
export function bnDateTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '';
  let h = d.getHours();
  const suffix = h < 12 ? 'পূর্বাহ্ণ' : 'অপরাহ্ণ';
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${bnDate(d)}, ${bn(h)}:${bn(mm)} ${suffix}`;
}

/** সাপ্তাহিক দিনের নাম — e.g. বৃহস্পতিবার */
export function bnWeekday(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return BN_WEEKDAYS[d.getDay()];
}

/** আপেক্ষিক সময় — e.g. ৫ মিনিট আগে */
export function bnRelative(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'এইমাত্র';
  if (min < 60) return `${bn(min)} মিনিট আগে`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${bn(hr)} ঘণ্টা আগে`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${bn(day)} দিন আগে`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${bn(month)} মাস আগে`;
  return `${bn(Math.floor(month / 12))} বছর আগে`;
}
