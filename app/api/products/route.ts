import { json, serverError } from '@/lib/api';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = await db();
    const [products, categories] = await Promise.all([store.listProducts(), store.listCategories()]);
    return json({ ok: true, products: products.filter((p) => p.active), categories });
  } catch {
    return serverError('পণ্য লোড করা যায়নি');
  }
}
