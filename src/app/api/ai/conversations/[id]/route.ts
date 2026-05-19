import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession();
  if (!s.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const convo = await prisma.aIConversation.findUnique({
    where: { id }, include: { project: true, messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!convo || convo.project.ownerId !== s.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ messages: convo.messages.map(m => ({ role: m.role, content: m.content })) });
}
