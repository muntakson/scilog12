import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { prisma } from '@/lib/prisma';
import { fmtDate } from '@/lib/format';

export default async function InterviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await prisma.interviewToken.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          owner: { select: { name: true, school: true, yearLevel: true } },
          logbook: { include: { sections: { orderBy: { order: 'asc' } } } },
          conversations: { orderBy: { createdAt: 'asc' }, include: { messages: { orderBy: { createdAt: 'asc' } } } },
          anchor: true,
        },
      },
    },
  });
  if (!t) notFound();
  const p = t.project;

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="text-xs text-slate-500">Interview view · {t.label || 'unlabeled'}</div>
        <h1 className="text-2xl font-bold mt-1">{p.title}</h1>
        <p className="text-sm text-slate-600">{p.description}</p>
        <div className="text-xs text-slate-500 mt-2">
          {p.owner.name}{p.owner.yearLevel ? ` · Year ${p.owner.yearLevel}` : ''}{p.owner.school ? ` · ${p.owner.school}` : ''}
          {p.submittedAt ? ` · Submitted ${fmtDate(p.submittedAt)}` : ' · DRAFT (not yet submitted)'}
        </div>
        {p.anchor && (
          <div className="mt-3 text-xs">
            <Link href={`/verify/${p.anchor.contentHash}`} className="text-emerald-700 hover:underline font-mono break-all">
              ✓ Verify hash {p.anchor.contentHash}
            </Link>
          </div>
        )}
      </div>

      <section className="card p-5">
        <h2 className="text-xl font-semibold mb-3">Lab logbook</h2>
        <div className="space-y-5">
          {p.logbook?.sections.map(s => (
            <div key={s.id}>
              <h3 className="font-semibold text-brand-700">{s.title}</h3>
              <div className="prose-logbook text-sm" dangerouslySetInnerHTML={{ __html: marked.parse(s.content || '*(empty)*') as string }} />
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold mb-1">AI conversations</h2>
        <p className="text-xs text-slate-500 mb-4">
          Every prompt the student wrote and every reply the AI gave, in order. This proves the student used AI as a tool — not a substitute for thinking.
        </p>
        <div className="space-y-6">
          {p.conversations.length === 0 && <p className="text-sm text-slate-500">No AI conversations recorded.</p>}
          {p.conversations.map(c => (
            <div key={c.id} className="border-l-4 border-brand-100 pl-4">
              <div className="text-sm font-semibold">{c.title}</div>
              <div className="text-xs text-slate-500 mb-2">{c.provider} · {c.model} · {fmtDate(c.createdAt)}</div>
              <div className="space-y-3">
                {c.messages.map(m => (
                  <div key={m.id} className="text-sm">
                    <div className="text-xs font-semibold text-slate-500">{m.role === 'user' ? 'Student' : 'AI'}</div>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
