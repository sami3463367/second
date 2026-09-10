import { badRequest, forbidden, json, readBody, serverError } from '@/lib/api';
import { guardAdmin } from '@/lib/api';
import { db } from '@/lib/store';
import type { Product } from '@/lib/types';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await guardAdmin();
  if (!admin) return forbidden();
  try {
    const store = await db();
    const products = await store.listProducts();
    return json({ ok: true, products });
  } catch {
    return serverError();
  }
}

export type ProductInput = Omit<Product, 'id' | 'createdAt'>;

export async function POST(req: Request) {
  const admin = await guardAdmin();
  if (!admin) return forbidden();
  try {
    const body = await readBody<Partial<ProductInput>>(req);
    if (!body) return badRequest('সঠিক তথ্য পাঠান');
    const name = (body.name || '').trim();
    if (name.length < 3) return badRequest('পণ্যের নাম দিন');
    if (!body.category) return badRequest('ক্যাটাগরি নির্বাচন করুন');
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) return badRequest('সঠিক দাম দিন');

    const store = await db();
    const baseSlug = slugify(name) || 'product';
    let slug = baseSlug;
    let n = 2;
    // slug ইউনিক রাখা
    while (await store.getProductBySlug(slug)) {
      slug = `${baseSlug}-${n}`;
      n += 1;
    }
    const product = await store.createProduct({
      slug,
      name,
      category: body.category,
      price,
      oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
      image: body.image || '/products/smartwatch.jpg',
      shortDescription: body.shortDescription || '',
      description: body.description || '',
      features: Array.isArray(body.features) ? body.features : [],
      specs: Array.isArray(body.specs) ? body.specs : [],
      stock: Number(body.stock ?? 0),
      rating: Number(body.rating ?? 0) || 4.5,
      reviewCount: Number(body.reviewCount ?? 0),
      badge: body.badge || null,
      featured: Boolean(body.featured),
      active: body.active !== false,
    });
    return json({ ok: true, product }, 201);
  } catch {
    return serverError('পণ্য যোগ করা যায়নি');
  }
}
