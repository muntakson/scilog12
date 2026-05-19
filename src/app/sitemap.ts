import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const SITE_URL = 'https://scilog12.iotok.org';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  ];

  const [products, anchors] = await Promise.all([
    prisma.product.findMany({ select: { id: true, createdAt: true } }).catch(() => []),
    prisma.blockchainAnchor
      .findMany({ select: { contentHash: true, anchoredAt: true } })
      .catch(() => []),
  ]);

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.id}`,
    lastModified: p.createdAt ?? now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const verifyPages: MetadataRoute.Sitemap = anchors.map((a) => ({
    url: `${SITE_URL}/verify/${a.contentHash}`,
    lastModified: a.anchoredAt ?? now,
    changeFrequency: 'yearly',
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...verifyPages];
}
