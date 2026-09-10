import type { MetadataRoute } from 'next';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://gadget-bazar.vercel.app';
  const store = await db();
  const [products, categories] = await Promise.all([store.listProducts(), store.listCategories()]);

  const staticRoutes = ['', '/products', '/about', '/faq', '/contact', '/login', '/register'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${base}/products?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const productRoutes = products
    .filter((p) => p.active)
    .map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
