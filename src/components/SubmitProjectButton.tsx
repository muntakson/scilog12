'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function SubmitProjectButton({ projectId }: { projectId: string }) {
  const [busy, start] = useTransition();
  const router = useRouter();
  function submit() {
    if (!confirm('Submitting will FREEZE the logbook and chat history and anchor a SHA-256 hash on the blockchain. Continue?')) return;
    start(async () => {
      const r = await fetch('/api/projects/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }) });
      const d = await r.json();
      if (!r.ok) { alert(d.error || 'Failed'); return; }
      router.refresh();
    });
  }
  return <button onClick={submit} disabled={busy} className="btn-primary">{busy ? 'Submitting…' : 'Submit & anchor'}</button>;
}
