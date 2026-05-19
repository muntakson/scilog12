import Link from 'next/link';

export function ProjectShopPanel() {
  return (
    <div className="text-sm">
      <p className="mb-3">Browse parts in the main shop. Items added to your cart persist across projects.</p>
      <Link href="/shop" className="btn-primary">Open shop →</Link>
    </div>
  );
}
