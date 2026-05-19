'use client';
import { useState } from 'react';
import { LogbookEditor, type LogbookForEditor } from './LogbookEditor';
import { ChatPanel, type ConversationForPanel } from './ChatPanel';
import { StlPanel } from './StlPanel';
import { ProjectShopPanel } from './ProjectShopPanel';

export type ProjectForTabs = {
  id: string;
  status: 'DRAFT' | 'SUBMITTED';
  logbook: LogbookForEditor | null;
  conversations: ConversationForPanel[];
  stlAssets: { id: string; name: string; prompt: string; status: string; createdAt: Date }[];
};

const TABS = [
  { id: 'chat', label: 'AI workbench' },
  { id: 'logbook', label: 'Logbook' },
  { id: 'stl', label: '3D-printable STL' },
  { id: 'shop', label: 'Parts shop' },
] as const;

export function ProjectTabs({ project }: { project: ProjectForTabs }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('chat');
  const frozen = project.status === 'SUBMITTED';
  return (
    <div className="card">
      <div className="border-b flex gap-1 px-2">
        {TABS.map(t => (
          <button key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tab === 'chat'    && <ChatPanel projectId={project.id} conversations={project.conversations} frozen={frozen} />}
        {tab === 'logbook' && project.logbook && <LogbookEditor logbook={project.logbook} frozen={frozen} />}
        {tab === 'stl'     && <StlPanel projectId={project.id} assets={project.stlAssets} frozen={frozen} />}
        {tab === 'shop'    && <ProjectShopPanel />}
      </div>
    </div>
  );
}
