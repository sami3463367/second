import { badRequest, forbidden, json, readBody, serverError } from '@/lib/api';
import { guardAdmin } from '@/lib/api';
import { db } from '@/lib/store';
import type { OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await guardAdmin();
  if (!admin) return forbidden();
  try {
    const { id } = await ctx.params;
    const body = await readBody<{ status?: OrderStatus; whatsappSent?: boolean }>(req);
    if (!body) return badRequest('সঠিক তথ্য পাঠান');
    const store = await db();
    if (body.status !== undefined && !STATUSES.includes(body.status)) return badRequest('অবৈধ স্ট্যাটাস');
    const order = await store.updateOrderStatus(id, body.status ?? 'pending');
    if (!order) return json({ ok: false, error: 'অর্ডার পাওয়া যায়নি' }, 404);
    return json({ ok: true, order });
  } catch {
    return serverError();
  }
}
