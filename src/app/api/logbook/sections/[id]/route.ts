import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession();
  if (!s.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const content = String(body.content ?? '');

  const section = await prisma.logbookSection.findUnique({
    where: { id }, include: { logbook: { include: { project: true } } },
  });
  if (!section || section.logbook.project.ownerId !== s.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (section.logbook.frozen) return NextResponse.json({ error: 'Logbook is frozen' }, { status: 400 });

  await prisma.logbookSection.update({ where: { id }, data: { content } });
  return NextResponse.json({ ok: true });
}
