import { forbidden, json, serverError } from '@/lib/api';
import { guardAdmin } from '@/lib/api';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await guardAdmin();
  if (!admin) return forbidden();
  try {
    const store = await db();
    const stats = await store.getStats();
    return json({ ok: true, stats, storeKind: store.kind });
  } catch {
    return serverError();
  }
}
