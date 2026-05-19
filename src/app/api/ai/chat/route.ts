import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AIProvider } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { callProvider } from '@/lib/ai';

const Body = z.object({
  projectId: z.string(),
  conversationId: z.string().nullable().optional(),
  provider: z.nativeEnum(AIProvider),
  model: z.string().min(1),
  prompt: z.string().min(1).max(20000),
});

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  const { projectId, provider, model, prompt } = parsed.data;
  let { conversationId } = parsed.data;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== s.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (project.status === 'SUBMITTED') return NextResponse.json({ error: 'Project is submitted (frozen)' }, { status: 400 });

  if (!conversationId) {
    const created = await prisma.aIConversation.create({
      data: { projectId, provider, model, title: prompt.slice(0, 60) || 'New conversation' },
    });
    conversationId = created.id;
  }

  await prisma.aIMessage.create({ data: { conversationId, role: 'user', content: prompt } });

  const prior = await prisma.aIMessage.findMany({
    where: { conversationId }, orderBy: { createdAt: 'asc' },
  });
  const history = prior.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  let result;
  try {
    result = await callProvider(provider, model, history);
  } catch (e: any) {
    const msg = e?.message || 'AI provider error';
    await prisma.aIMessage.create({ data: { conversationId, role: 'assistant', content: `[error] ${msg}` } });
    return NextResponse.json({ error: msg, conversationId }, { status: 500 });
  }

  await prisma.aIMessage.create({
    data: {
      conversationId, role: 'assistant', content: result.reply,
      inputTokens: result.inputTokens, outputTokens: result.outputTokens,
    },
  });

  return NextResponse.json({ conversationId, reply: result.reply });
}
