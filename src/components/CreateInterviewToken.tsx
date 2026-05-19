'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { fmtDate } from '@/lib/format';

export function CreateInterviewToken({ projectId, tokens }: { projectId: string; tokens: { id: string; token: string; label: string | null; createdAt: Date }[] }) {
  const [label, setLabel] = useState('');
  const [busy, start] = useTransition();
  const router = useRouter();
  function create() {
    start(async () => {
      await fetch('/api/interview-tokens', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, label: label || null }) });
      setLabel('');
      router.refresh();
    });
  }
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return (
    <div className="card p-5">
      <h2 className="font-semibold mb-2">Interview links</h2>
      <p className="text-sm text-slate-600 mb-3">Generate a read-only link an admissions officer can open without an account. They'll see the full logbook plus your entire AI conversation history.</p>
      <div className="flex gap-2 mb-3">
        <input className="input" placeholder="Label (e.g. SNU admissions, KAIST interview)" value={label} onChange={e => setLabel(e.target.value)} />
        <button onClick={create} disabled={busy} className="btn-primary">{busy ? '…' : 'Create link'}</button>
      </div>
      {tokens.length > 0 && (
        <ul className="space-y-2">
          {tokens.map(t => {
            const url = `${base}/interview/${t.token}`;
            return (
              <li key={t.id} className="border rounded p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{t.label || 'Unlabeled'}</div>
                    <div className="text-xs text-slate-500">Created {fmtDate(t.createdAt)}</div>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(url)} className="btn-ghost text-xs">Copy link</button>
                </div>
                <code className="text-xs text-slate-600 break-all">{url}</code>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
