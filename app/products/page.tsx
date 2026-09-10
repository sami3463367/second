import type { Metadata } from 'next';
import { ProductBrowser } from '@/components/product-browser';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'সব পণ্য',
  description: 'গ্যাজেট বাজারের সব ইলেকট্রনিক গ্যাজেট এক নজরে — সাশ্রয়ী দামে, ক্যাশ অন ডেলিভারিতে।',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const store = await db();
  const [products, categories] = await Promise.all([store.listProducts(), store.listCategories()]);

  return (
    <div className="container-gb py-6">
      <ProductBrowser
        products={products.filter((p) => p.active)}
        categories={categories}
        initialQuery={params.q || ''}
        initialCategory={params.category || ''}
        initialSort={params.sort || 'newest'}
      />
    </div>
  );
}
