import { badRequest, json, readBody, serverError, unauthorized } from '@/lib/api';
import { setSessionCookie, verifyPassword } from '@/lib/auth';
import { db } from '@/lib/store';
import { toSafeUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface LoginBody {
  identifier?: string;
  password?: string;
}

export async function POST(req: Request) {
  try {
    const body = await readBody<LoginBody>(req);
    if (!body) return badRequest('সঠিক তথ্য পাঠান');
    const identifier = (body.identifier || '').trim().toLowerCase();
    const password = body.password || '';
    if (!identifier || !password) return badRequest('ইমেইল/মোবাইল ও পাসওয়ার্ড দিন');

    const store = await db();
    const looksLikeEmail = identifier.includes('@');
    const user = looksLikeEmail
      ? await store.findUserByEmail(identifier)
      : await store.findUserByPhone(identifier.replace(/[\s-]/g, ''));

    if (!user) return unauthorized('এই ইমেইল/মোবাইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি');
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return unauthorized('পাসওয়ার্ড সঠিক নয়');

    await setSessionCookie(toSafeUser(user));
    return json({ ok: true, user: toSafeUser(user) });
  } catch {
    return serverError('লগইন করা যায়নি');
  }
}
