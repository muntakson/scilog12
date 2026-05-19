import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function login(formData: FormData) {
  'use server';
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const password = String(formData.get('password') || '');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect('/login?error=invalid');
  }
  const s = await getSession();
  s.userId = user.id; s.email = user.email; s.name = user.name; s.role = user.role;
  await s.save();
  redirect(user.role === 'ADMIN' ? '/admin' : '/dashboard');
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="max-w-md mx-auto card p-6 mt-12">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <form action={login} className="space-y-3">
        <div><label className="label">Email</label><input className="input" name="email" type="email" required defaultValue="don@example.com" /></div>
        <div><label className="label">Password</label><input className="input" name="password" type="password" required defaultValue="password123" /></div>
        {error && <p className="text-sm text-red-600">Invalid email or password.</p>}
        <button type="submit" className="btn-primary w-full">Sign in</button>
      </form>
      <p className="text-sm text-slate-600 mt-4">No account? <Link href="/register" className="text-brand-600 hover:underline">Create one</Link>.</p>
      <p className="text-xs text-slate-500 mt-2">Demo: don@example.com / password123</p>
    </div>
  );
}
