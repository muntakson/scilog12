'use client';
import { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';

export type LogbookForEditor = {
  id: string;
  sections: { id: string; key: string; title: string; content: string; order: number }[];
};

export function LogbookEditor({ logbook, frozen }: { logbook: LogbookForEditor; frozen: boolean }) {
  const [sections, setSections] = useState(logbook.sections);
  const [activeKey, setActiveKey] = useState(sections[0]?.key);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debouncers = useRef<Record<string, number>>({});

  const active = sections.find(s => s.key === activeKey);

  function update(key: string, content: string) {
    setSections(prev => prev.map(s => s.key === key ? { ...s, content } : s));
    if (frozen) return;
    setSaveState('saving');
    const sec = sections.find(s => s.key === key);
    if (!sec) return;
    window.clearTimeout(debouncers.current[sec.id]);
    debouncers.current[sec.id] = window.setTimeout(async () => {
      await fetch(`/api/logbook/sections/${sec.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1200);
    }, 600);
  }

  if (!active) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
      <aside className="border rounded">
        <ul>
          {sections.map(s => (
            <li key={s.key}>
              <button onClick={() => setActiveKey(s.key)}
                className={`w-full text-left px-3 py-2 text-sm border-b last:border-b-0 hover:bg-slate-50 ${activeKey === s.key ? 'bg-brand-50 text-brand-700 font-medium' : ''}`}>
                {s.title}
                {s.content.trim() ? <span className="float-right text-emerald-600">●</span> : <span className="float-right text-slate-300">○</span>}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{active.title}</h3>
          <div className="text-xs text-slate-500">
            {frozen ? 'Frozen (submitted)' : saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Markdown supported'}
          </div>
        </div>
        <textarea
          value={active.content}
          onChange={e => update(active.key, e.target.value)}
          disabled={frozen}
          rows={14}
          placeholder={`Write the ${active.title.toLowerCase()} here. You can use **markdown**, lists, and code blocks.`}
          className="input font-mono text-sm disabled:bg-slate-50 disabled:text-slate-600"
        />
        {active.content && (
          <details className="mt-3">
            <summary className="text-xs text-slate-500 cursor-pointer">Preview</summary>
            <div className="prose-logbook p-3 mt-2 bg-slate-50 border rounded" dangerouslySetInnerHTML={{ __html: marked.parse(active.content) as string }} />
          </details>
        )}
      </div>
    </div>
  );
}
