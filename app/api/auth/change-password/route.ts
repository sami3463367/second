import { badRequest, json, readBody, serverError, unauthorized } from '@/lib/api';
import { getSession, hashPassword, verifyPassword } from '@/lib/auth';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

interface Body {
  current?: string;
  next?: string;
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();
    const body = await readBody<Body>(req);
    if (!body) return badRequest('সঠিক তথ্য পাঠান');
    const current = body.current || '';
    const next = body.next || '';
    if (next.length < 6) return badRequest('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');

    const store = await db();
    const user = await store.getUserById(session.sub);
    if (!user) return unauthorized();
    const ok = await verifyPassword(current, user.passwordHash);
    if (!ok) return badRequest('বর্তমান পাসওয়ার্ড সঠিক নয়');

    await store.updateUserPassword(user.id, await hashPassword(next));
    return json({ ok: true });
  } catch {
    return serverError('পাসওয়ার্ড বদলানো যায়নি');
  }
}
