import { badRequest, json, readBody, serverError } from '@/lib/api';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { db } from '@/lib/store';
import { toSafeUser } from '@/lib/types';
import { isValidBdPhone, isValidEmail } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface RegisterBody {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export async function POST(req: Request) {
  try {
    const body = await readBody<RegisterBody>(req);
    if (!body) return badRequest('সঠিক তথ্য পাঠান');
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const phone = (body.phone || '').replace(/[\s-]/g, '');
    const password = body.password || '';

    if (name.length < 3) return badRequest('নাম কমপক্ষে ৩ অক্ষরের হতে হবে');
    if (!isValidEmail(email)) return badRequest('সঠিক ইমেইল ঠিকানা দিন');
    if (!isValidBdPhone(phone)) return badRequest('সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন 01712345678)');
    if (password.length < 6) return badRequest('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');

    const store = await db();
    if (await store.findUserByEmail(email)) return badRequest('এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে');
    if (await store.findUserByPhone(phone)) return badRequest('এই মোবাইল নম্বরে আগে থেকেই অ্যাকাউন্ট আছে');

    const user = await store.createUser({
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
      role: 'customer',
    });
    await setSessionCookie(toSafeUser(user));
    return json({ ok: true, user: toSafeUser(user) }, 201);
  } catch {
    return serverError('অ্যাকাউন্ট তৈরি করা যায়নি');
  }
}
