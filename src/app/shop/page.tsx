import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { fmtMoney } from '@/lib/format';

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const products = await prisma.product.findMany({
    where: cat ? { category: cat.toUpperCase() as any } : undefined,
    orderBy: { name: 'asc' },
  });
  const cats = ['ALL','ELECTRICAL','BIOLOGICAL','CHEMICAL','MECHANICAL'];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Parts shop</h1>
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <Link key={c}
            href={c === 'ALL' ? '/shop' : `/shop?cat=${c.toLowerCase()}`}
            className={`px-3 py-1.5 rounded text-sm border ${ (cat || 'ALL') === (c === 'ALL' ? undefined : c.toLowerCase()) || (!cat && c === 'ALL') ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-300 hover:bg-slate-50'}`}>
            {c}
          </Link>
        ))}
      </div>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <li key={p.id} className="card p-4 flex flex-col">
            <div className="aspect-video bg-slate-100 rounded mb-3 flex items-center justify-center text-3xl text-slate-400">
              {p.category === 'ELECTRICAL' ? '⚡' : p.category === 'CHEMICAL' ? '🧪' : p.category === 'BIOLOGICAL' ? '🧬' : '⚙️'}
            </div>
            <Link href={`/shop/${p.id}`} className="font-semibold hover:underline">{p.name}</Link>
            <div className="text-xs text-slate-500 mt-1">{p.category} · {p.sku}</div>
            <p className="text-sm text-slate-600 mt-2 flex-1 line-clamp-2">{p.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold">{fmtMoney(p.priceCents)}</span>
              <Link href={`/shop/${p.id}`} className="btn-primary text-sm">View</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
