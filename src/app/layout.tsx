import './globals.css';
import { ReactNode } from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/session';

export const metadata = { title: 'scilog12 — Student science portal', description: 'AI-assisted science projects, 3D-printable apparatus, parts shop, and blockchain-verified logbooks for year 7–12 students.' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b bg-white">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-brand-600 text-lg">scilog<span className="text-slate-900">12</span></Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/shop" className="hover:underline">Shop</Link>
              {session.userId ? (
                <>
                  <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                  <Link href="/cart" className="hover:underline">Cart</Link>
                  <Link href="/orders" className="hover:underline">Orders</Link>
                  <span className="text-slate-500">{session.name}</span>
                  <form action="/api/auth/logout" method="post"><button className="text-slate-500 hover:text-slate-900">Sign out</button></form>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:underline">Sign in</Link>
                  <Link href="/register" className="px-3 py-1.5 bg-brand-600 text-white rounded hover:bg-brand-700">Get started</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t mt-16 py-6 text-center text-xs text-slate-500">
          scilog12 · Built for curious students · Logbooks verified on Base Sepolia
        </footer>
      </body>
    </html>
  );
}
