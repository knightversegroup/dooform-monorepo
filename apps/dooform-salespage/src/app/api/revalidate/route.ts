import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_LOCALES = new Set(['en', 'th']);

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET is not configured' },
      { status: 500 }
    );
  }

  const raw = await request.text();
  const signature = request.headers.get('x-revalidate-signature') ?? '';

  const expected = createHmac('sha256', secret).update(raw).digest('hex');

  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let payload: { locale?: string };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const locale = payload.locale;
  if (!locale || !VALID_LOCALES.has(locale)) {
    return NextResponse.json({ error: 'unknown locale' }, { status: 400 });
  }

  revalidateTag(`salespage:${locale}`, { expire: 0 });

  return NextResponse.json({ revalidated: locale });
}
