import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { Role } from '@prisma/client';

export type SessionData = {
  userId?: string;
  email?: string;
  name?: string;
  role?: Role;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'change_me_change_me_change_me_change_me_change_me',
  cookieName: 'scilog12_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireUser() {
  const s = await getSession();
  if (!s.userId) throw new Error('UNAUTHENTICATED');
  return s as Required<Pick<SessionData, 'userId' | 'email' | 'role' | 'name'>>;
}
