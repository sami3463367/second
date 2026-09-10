import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/shell';

export const metadata: Metadata = {
  title: 'অ্যাডমিন প্যানেল',
  description: 'গ্যাজেট বাজার অ্যাডমিন প্যানেল — অর্ডার, পণ্য ও সেটিংস ব্যবস্থাপনা।',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
