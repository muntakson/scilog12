import './globals.css';
import { ReactNode } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getSession } from '@/lib/session';

const SITE_URL = 'https://scilog12.iotok.org';
const TITLE = 'scilog12 — AI 과학 프로젝트 · 학생 연구노트 · 블록체인 봉인';
const DESCRIPTION =
  '중·고등학생을 위한 AI 과학 프로젝트 포털. Claude·Gemini·GROQ·DeepSeek 으로 연구노트를 작성하고, 부품을 구매하며, Base 블록체인에 봉인하여 대입 면접에 활용하세요. Open-source science logbook + blockchain notary for year 7–12 students.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · scilog12' },
  description: DESCRIPTION,
  applicationName: 'scilog12',
  keywords: [
    '학생 연구노트', '연구노트 블록체인', 'AI 과학 프로젝트', '중학생 과학', '고등학생 과학',
    '과학고 입시', '학생부 종합전형', '대입 면접', '자기소개서',
    'STEM education', 'science logbook', 'blockchain notary', 'research notebook',
    'Claude', 'Gemini', 'Next.js', 'Base Sepolia',
  ],
  authors: [{ name: '사단법인 나눔과기술 (Engineers and Scientists for Sharing)' }],
  creator: '사단법인 나눔과기술',
  publisher: '사단법인 나눔과기술',
  category: 'education',
  alternates: {
    canonical: '/',
    languages: { 'ko-KR': '/', 'en-US': '/', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: ['en_US'],
    url: SITE_URL,
    siteName: 'scilog12',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'scilog12',
      description: DESCRIPTION,
      inLanguage: ['ko-KR', 'en-US'],
      publisher: { '@id': `${SITE_URL}/#org` },
    },
    {
      '@type': ['Organization', 'EducationalOrganization'],
      '@id': `${SITE_URL}/#org`,
      name: '사단법인 나눔과기술',
      alternateName: 'Engineers and Scientists for Sharing',
      url: SITE_URL,
      sameAs: ['https://github.com/muntakson/scilog12'],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'scilog12',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      url: SITE_URL,
      author: { '@id': `${SITE_URL}/#org` },
    },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
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
