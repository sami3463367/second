import { json } from '@/lib/api';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const store = await db();
  const order = await store.getOrderById(id);
  if (!order) return json({ ok: false, error: 'অর্ডার পাওয়া যায়নি' }, 404);
  return json({ ok: true, order });
}
