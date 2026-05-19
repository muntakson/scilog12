import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function VerifyPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  const anchor = await prisma.blockchainAnchor.findFirst({
    where: { contentHash: hash },
    include: { project: { include: { owner: { select: { name: true, school: true } } } } },
  });
  if (!anchor) {
    return (
      <div className="max-w-xl mx-auto card p-6">
        <h1 className="text-xl font-bold">Hash not found</h1>
        <p className="text-sm text-slate-600 mt-2">No project has been anchored with this hash on scilog12.</p>
        <p className="font-mono text-xs break-all mt-3">{hash}</p>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto card p-6 space-y-3">
      <h1 className="text-xl font-bold">Verified ✓</h1>
      <div className="text-sm">
        <div><span className="text-slate-500">Project:</span> <strong>{anchor.project.title}</strong></div>
        <div><span className="text-slate-500">Student:</span> {anchor.project.owner.name}{anchor.project.owner.school ? `, ${anchor.project.owner.school}` : ''}</div>
        <div><span className="text-slate-500">Submitted:</span> {anchor.project.submittedAt?.toISOString()}</div>
      </div>
      <div className="font-mono text-xs break-all bg-slate-50 border rounded p-2">SHA-256: {anchor.contentHash}</div>
      {anchor.txHash ? (
        <div className="text-xs">
          <div>Chain: <strong>{anchor.chainName}</strong></div>
          <div>Contract: <span className="font-mono">{anchor.contract}</span></div>
          <div>Tx: <a className="text-brand-600 hover:underline font-mono break-all" href={`https://sepolia.basescan.org/tx/${anchor.txHash}`} target="_blank" rel="noreferrer">{anchor.txHash}</a></div>
          <div>Block: {anchor.blockNumber}</div>
        </div>
      ) : (
        <p className="text-xs text-amber-700">Hash recorded in scilog12 but not yet broadcast on chain. (Server-side NOTARY_PRIVATE_KEY / NOTARY_CONTRACT_ADDRESS were not configured at the time of submission.)</p>
      )}
      <p className="text-xs text-slate-500">
        Anyone can recompute the hash from the logbook + AI conversation snapshot (canonicalized JSON, SHA-256) and compare to what is recorded here / on-chain to prove the content has not been altered since submission.
      </p>
      <Link href="/" className="text-sm text-brand-600 hover:underline">← Home</Link>
    </div>
  );
}
