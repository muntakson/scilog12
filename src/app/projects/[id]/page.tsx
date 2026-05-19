import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { fmtDate } from '@/lib/format';
import { ProjectTabs } from '@/components/ProjectTabs';
import { SubmitProjectButton } from '@/components/SubmitProjectButton';
import { CreateInterviewToken } from '@/components/CreateInterviewToken';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession();
  if (!s.userId) redirect('/login');
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      logbook: { include: { sections: { orderBy: { order: 'asc' } } } },
      conversations: { orderBy: { createdAt: 'desc' }, include: { _count: { select: { messages: true } } } },
      stlAssets: { orderBy: { createdAt: 'desc' } },
      anchor: true,
      interviewTokens: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!project || project.ownerId !== s.userId) notFound();
  const frozen = project.status === 'SUBMITTED';
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">← Dashboard</Link>
          <h1 className="text-2xl font-bold mt-1">{project.title}</h1>
          {project.description && <p className="text-slate-600 mt-1">{project.description}</p>}
          <p className="text-xs text-slate-500 mt-1">Created {fmtDate(project.createdAt)} · Updated {fmtDate(project.updatedAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          {frozen ? (
            <span className="px-3 py-1 rounded text-sm bg-emerald-50 text-emerald-700 border border-emerald-200">Submitted</span>
          ) : (
            <SubmitProjectButton projectId={project.id} />
          )}
        </div>
      </div>

      {project.anchor && (
        <div className="card p-4 bg-emerald-50 border-emerald-200">
          <div className="font-semibold text-emerald-800">Logbook anchored on chain</div>
          <div className="text-xs text-emerald-900 mt-1 font-mono break-all">hash: {project.anchor.contentHash}</div>
          {project.anchor.txHash ? (
            <div className="text-xs text-emerald-900 mt-1 font-mono break-all">
              tx: {project.anchor.txHash} {project.anchor.blockNumber ? `(block ${project.anchor.blockNumber})` : ''}
            </div>
          ) : (
            <div className="text-xs text-emerald-900 mt-1">On-chain transaction pending — set NOTARY_PRIVATE_KEY and NOTARY_CONTRACT_ADDRESS to enable real anchoring.</div>
          )}
          <Link className="text-xs text-brand-600 hover:underline mt-2 inline-block" href={`/verify/${project.anchor.contentHash}`}>Public verify page →</Link>
        </div>
      )}

      <ProjectTabs project={project} />

      <CreateInterviewToken projectId={project.id} tokens={project.interviewTokens} />
    </div>
  );
}
