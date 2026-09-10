import { forbidden, json, readBody, serverError } from '@/lib/api';
import { guardAdmin } from '@/lib/api';
import { db } from '@/lib/store';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await guardAdmin();
  if (!admin) return forbidden();
  try {
    const { id } = await ctx.params;
    const body = await readBody<Partial<Product>>(req);
    if (!body) return json({ ok: false, error: 'সঠিক তথ্য পাঠান' }, 400);
    const store = await db();
    const patch: Partial<Product> = {};
    const keys: (keyof Product)[] = [
      'name',
      'category',
      'price',
      'oldPrice',
      'image',
      'shortDescription',
      'description',
      'features',
      'specs',
      'stock',
      'rating',
      'reviewCount',
      'badge',
      'featured',
      'active',
      'slug',
    ];
    keys.forEach((k) => {
      if (body[k] !== undefined) (patch as Record<string, unknown>)[k] = body[k];
    });
    const updated = await store.updateProduct(id, patch);
    if (!updated) return json({ ok: false, error: 'পণ্য পাওয়া যায়নি' }, 404);
    return json({ ok: true, product: updated });
  } catch {
    return serverError('পণ্য আপডেট করা যায়নি');
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await guardAdmin();
  if (!admin) return forbidden();
  try {
    const { id } = await ctx.params;
    const store = await db();
    await store.deleteProduct(id);
    return json({ ok: true });
  } catch {
    return serverError('পণ্য ডিলিট করা যায়নি');
  }
}
