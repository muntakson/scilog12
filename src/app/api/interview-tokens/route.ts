import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { projectId, label } = await req.json();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== s.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const token = crypto.randomBytes(24).toString('base64url');
  const t = await prisma.interviewToken.create({
    data: { projectId, issuedToId: s.userId, token, label: label || null },
  });
  return NextResponse.json({ token: t.token });
}
