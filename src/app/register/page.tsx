import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function register(formData: FormData) {
  'use server';
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const password = String(formData.get('password') || '');
  const name = String(formData.get('name') || '').trim();
  const yearLevel = Number(formData.get('yearLevel') || 0) || null;
  const school = String(formData.get('school') || '').trim() || null;
  if (!email || !password || !name) redirect('/register?error=missing');
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) redirect('/register?error=exists');
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash: hash, name, yearLevel, school, role: 'STUDENT' },
  });
  await prisma.cart.create({ data: { userId: user.id } });
  const s = await getSession();
  s.userId = user.id; s.email = user.email; s.name = user.name; s.role = user.role;
  await s.save();
  redirect('/dashboard');
}

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="max-w-md mx-auto card p-6 mt-12">
      <h1 className="text-2xl font-bold mb-4">Create student account</h1>
      <form action={register} className="space-y-3">
        <div><label className="label">Full name</label><input className="input" name="name" required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Year (7–12)</label><input className="input" name="yearLevel" type="number" min={7} max={12} /></div>
          <div><label className="label">School</label><input className="input" name="school" /></div>
        </div>
        <div><label className="label">Email</label><input className="input" name="email" type="email" required /></div>
        <div><label className="label">Password</label><input className="input" name="password" type="password" required minLength={8} /></div>
        {error === 'exists' && <p className="text-sm text-red-600">An account with that email already exists.</p>}
        {error === 'missing' && <p className="text-sm text-red-600">Please fill all required fields.</p>}
        <button type="submit" className="btn-primary w-full">Create account</button>
      </form>
      <p className="text-sm text-slate-600 mt-4">Have an account? <Link href="/login" className="text-brand-600 hover:underline">Sign in</Link>.</p>
    </div>
  );
}
