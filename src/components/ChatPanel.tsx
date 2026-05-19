'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export type ConversationForPanel = {
  id: string;
  title: string;
  provider: string;
  model: string;
  createdAt: Date;
  _count: { messages: number };
};

const PROVIDERS = [
  { id: 'ANTHROPIC', label: 'Claude (Anthropic)', model: 'claude-opus-4-7' },
  { id: 'GEMINI',    label: 'Gemini (Google)',     model: 'gemini-2.0-flash-exp' },
  { id: 'GROQ',      label: 'GROQ (Llama 3.3)',    model: 'llama-3.3-70b-versatile' },
  { id: 'DEEPSEEK',  label: 'DeepSeek Chat',       model: 'deepseek-chat' },
] as const;

export function ChatPanel({ projectId, conversations, frozen }: { projectId: string; conversations: ConversationForPanel[]; frozen: boolean }) {
  const router = useRouter();
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]['id']>('ANTHROPIC');
  const [model, setModel] = useState<string>('claude-opus-4-7');
  const [prompt, setPrompt] = useState('');
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(conversations[0]?.id ?? null);
  const [thread, setThread] = useState<{ role: string; content: string }[]>([]);

  async function loadConversation(id: string) {
    setConversationId(id);
    const r = await fetch(`/api/ai/conversations/${id}`);
    const d = await r.json();
    setThread(d.messages || []);
  }

  async function send() {
    if (!prompt.trim()) return;
    const userMsg = prompt.trim();
    setPrompt('');
    setError(null);
    setThread(t => [...t, { role: 'user', content: userMsg }]);
    startTransition(async () => {
      try {
        const r = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, conversationId, provider, model, prompt: userMsg }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed');
        setConversationId(d.conversationId);
        setThread(t => [...t, { role: 'assistant', content: d.reply }]);
        router.refresh();
      } catch (e: any) {
        setError(e.message);
        setThread(t => t.slice(0, -1));
        setPrompt(userMsg);
      }
    });
  }

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-4">
      <aside>
        <button
          disabled={frozen}
          onClick={() => { setConversationId(null); setThread([]); }}
          className="btn-ghost w-full mb-2 text-sm disabled:opacity-50">+ New conversation</button>
        <ul className="space-y-1">
          {conversations.map(c => (
            <li key={c.id}>
              <button onClick={() => loadConversation(c.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded ${conversationId === c.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'}`}>
                <div className="font-medium truncate">{c.title}</div>
                <div className="text-xs text-slate-500">{c.provider} · {c._count.messages} msgs</div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-col min-h-[420px]">
        <div className="flex gap-2 mb-3 items-center">
          <select className="input max-w-[260px]" value={provider}
            onChange={e => {
              const p = e.target.value as any;
              setProvider(p);
              const found = PROVIDERS.find(x => x.id === p);
              if (found) setModel(found.model);
            }}>
            {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <input className="input" value={model} onChange={e => setModel(e.target.value)} placeholder="model id" />
        </div>

        <div className="flex-1 border rounded bg-slate-50 p-3 overflow-y-auto space-y-3 mb-3 max-h-[420px]">
          {thread.length === 0 ? (
            <p className="text-sm text-slate-500">Start by asking the AI to help you design your experiment, generate STL code, or draft firmware. Every message is saved and visible to your interviewer.</p>
          ) : (
            thread.map((m, i) => (
              <div key={i} className={`text-sm whitespace-pre-wrap ${m.role === 'user' ? '' : 'pl-3 border-l-2 border-brand-200'}`}>
                <div className="text-xs font-semibold text-slate-500 mb-1">{m.role === 'user' ? 'You' : 'AI'}</div>
                {m.content}
              </div>
            ))
          )}
        </div>

        {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
        <div className="flex gap-2">
          <textarea
            disabled={frozen || busy}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(); }}
            rows={3}
            placeholder={frozen ? 'Project submitted — chat is locked.' : 'Ask the AI… (Ctrl+Enter to send)'}
            className="input flex-1 disabled:bg-slate-100" />
          <button disabled={frozen || busy} onClick={send} className="btn-primary">{busy ? '…' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}
