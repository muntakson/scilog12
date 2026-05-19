import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { projectId, name, prompt } = await req.json();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== s.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (project.status === 'SUBMITTED') return NextResponse.json({ error: 'Project is frozen' }, { status: 400 });

  const asset = await prisma.stlAsset.create({
    data: { projectId, name: String(name).slice(0, 80), prompt: String(prompt).slice(0, 5000), status: 'pending' },
  });
  return NextResponse.json({ ok: true, id: asset.id, note: 'STL generation is in preview. Prompt saved; real OpenSCAD → STL rendering is on the roadmap.' });
}
