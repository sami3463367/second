import { NextResponse } from 'next/server';
import { requireAdmin, getSession } from './auth';
import type { SessionPayload } from './auth';

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export function unauthorized(message = 'লগইন প্রয়োজন'): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export function forbidden(message = 'অ্যাডমিন অনুমতি প্রয়োজন'): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status: 403 });
}

export function serverError(message = 'সার্ভার সমস্যা, আবার চেষ্টা করুন'): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}

export async function apiSession(): Promise<SessionPayload | null> {
  return getSession();
}

/** অ্যাডমিন-only রুটের জন্য গার্ড; null হলে রিটার্ন করা রেসপন্স পাঠিয়ে দিন */
export async function guardAdmin(): Promise<SessionPayload | null> {
  return requireAdmin();
}

export async function readBody<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
