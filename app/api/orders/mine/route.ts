import { json, unauthorized } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  const store = await db();
  const orders = await store.listOrdersByUser(session.sub);
  return json({ ok: true, orders });
}
