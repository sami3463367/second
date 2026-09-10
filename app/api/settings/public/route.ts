import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

/** পাবলিক সেটিংস (হোয়াটসঅ্যাপ নম্বর, ডেলিভারি চার্জ ইত্যাদি) */
export async function GET() {
  try {
    const store = await db();
    const settings = await store.getSettings();
    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ ok: false, error: 'সেটিংস লোড করা যায়নি' }, { status: 500 });
  }
}
