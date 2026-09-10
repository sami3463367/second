import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SITE } from '@/lib/config';
import { db } from '@/lib/store';
import { StoreProvider } from '@/components/store-context';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BottomNav } from '@/components/bottom-nav';
import { WhatsAppFab } from '@/components/whatsapp-fab';
import { Toaster } from '@/components/toaster';

export const metadata: Metadata = {
  metadataBase: SITE.url ? new URL(SITE.url) : new URL('http://localhost:3000'),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ['গ্যাজেট', 'ইলেকট্রনিক্স', 'স্মার্টওয়াচ', 'ইয়ারবাডস', 'বাংলাদেশ', 'অনলাইন শপ', 'ক্যাশ অন ডেলিভারি'],
  authors: [{ name: SITE.nameEn }],
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ['/og.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await db();
  const settings = await store.getSettings();

  return (
    <html lang="bn">
      <body>
        <StoreProvider initialSettings={settings}>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <BottomNav />
          <WhatsAppFab />
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
