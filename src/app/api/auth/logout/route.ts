import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST() {
  const s = await getSession();
  s.destroy();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3031'));
}
