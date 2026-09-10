import { json } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/store';
import { toSafeUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return json({ ok: true, user: null });
  const store = await db();
  const user = await store.getUserById(session.sub);
  if (!user) return json({ ok: true, user: null });
  return json({ ok: true, user: toSafeUser(user) });
}
