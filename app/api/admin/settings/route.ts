import { forbidden, json, readBody, serverError } from '@/lib/api';
import { guardAdmin } from '@/lib/api';
import { isAuthSecretConfigured, isDatabaseConfigured } from '@/lib/config';
import { db } from '@/lib/store';
import type { Settings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await guardAdmin();
  if (!admin) return forbidden();
  try {
    const store = await db();
    const settings = await store.getSettings();
    return json({
      ok: true,
      settings,
      env: {
        databaseConfigured: isDatabaseConfigured(),
        authSecretConfigured: isAuthSecretConfigured(),
        storeKind: store.kind,
      },
    });
  } catch {
    return serverError();
  }
}

export async function PUT(req: Request) {
  const admin = await guardAdmin();
  if (!admin) return forbidden();
  try {
    const body = await readBody<Partial<Settings>>(req);
    if (!body) return json({ ok: false, error: 'সঠিক তথ্য পাঠান' }, 400);
    const store = await db();
    const allowed: (keyof Settings)[] = [
      'storeName',
      'tagline',
      'announcement',
      'whatsappNumber',
      'supportPhone',
      'supportEmail',
      'address',
      'deliveryCharge',
      'deliveryChargeOutside',
      'freeDeliveryOver',
      'facebookUrl',
      'youtubeUrl',
    ];
    const patch: Partial<Settings> = {};
    allowed.forEach((k) => {
      if (body[k] !== undefined) (patch as Record<string, unknown>)[k] = body[k];
    });
    const settings = await store.updateSettings(patch);
    return json({ ok: true, settings });
  } catch {
    return serverError('সেটিংস সংরক্ষণ করা যায়নি');
  }
}
