import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { canonicalize, sha256Hex, anchorOnChain } from '@/lib/notary';

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { projectId } = await req.json();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      logbook: { include: { sections: { orderBy: { order: 'asc' } } } },
      conversations: { orderBy: { createdAt: 'asc' }, include: { messages: { orderBy: { createdAt: 'asc' } } } },
    },
  });
  if (!project || project.ownerId !== s.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (project.status === 'SUBMITTED') return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
  if (!project.logbook) return NextResponse.json({ error: 'No logbook' }, { status: 400 });

  const empty = project.logbook.sections.filter(s => !s.content.trim()).map(s => s.title);
  if (empty.length > 0) return NextResponse.json({ error: `Fill all sections first. Empty: ${empty.join(', ')}` }, { status: 400 });

  const snapshot = {
    project: { id: project.id, title: project.title, description: project.description, submittedAt: new Date().toISOString() },
    logbook: project.logbook.sections.map(s => ({ key: s.key, title: s.title, content: s.content })),
    conversations: project.conversations.map(c => ({
      provider: c.provider, model: c.model, title: c.title, createdAt: c.createdAt.toISOString(),
      messages: c.messages.map(m => ({ role: m.role, content: m.content, createdAt: m.createdAt.toISOString() })),
    })),
  };
  const canonical = canonicalize(snapshot);
  const hash = sha256Hex(canonical);

  let txInfo: { txHash: string; blockNumber: number; contract: string } | null = null;
  try { txInfo = await anchorOnChain(hash); } catch (e) { console.error('anchor failed', e); }

  await prisma.$transaction([
    prisma.project.update({ where: { id: project.id }, data: { status: 'SUBMITTED', submittedAt: new Date() } }),
    prisma.logbook.update({ where: { id: project.logbook.id }, data: { frozen: true } }),
    prisma.blockchainAnchor.create({
      data: {
        projectId: project.id, contentHash: hash,
        txHash: txInfo?.txHash, blockNumber: txInfo?.blockNumber,
        contract: txInfo?.contract,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, hash, txHash: txInfo?.txHash ?? null });
}
