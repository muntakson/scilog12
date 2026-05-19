import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { fmtDate } from '@/lib/format';

async function createProject(formData: FormData) {
  'use server';
  const s = await getSession();
  if (!s.userId) redirect('/login');
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim() || null;
  if (!title) return;
  const LOGBOOK_SECTIONS = [
    ['introduction','Introduction'],['materials_apparatus','Materials & Apparatus'],
    ['procedure','Procedure'],['results','Results'],['discussion','Discussion'],
    ['conclusion','Conclusion'],['acknowledgments','Acknowledgments'],['references','References'],
  ] as const;
  const p = await prisma.project.create({
    data: {
      ownerId: s.userId, title, description,
      logbook: { create: { sections: { create: LOGBOOK_SECTIONS.map(([key,title],i)=>({ key, title, order: i })) } } },
    },
  });
  redirect(`/projects/${p.id}`);
}

export default async function Dashboard() {
  const s = await getSession();
  if (!s.userId) redirect('/login');
  const projects = await prisma.project.findMany({
    where: { ownerId: s.userId },
    orderBy: { updatedAt: 'desc' },
    include: { anchor: true, _count: { select: { conversations: true } } },
  });
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome back, {s.name}</h1>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Start a new project</h2>
        <form action={createProject} className="grid md:grid-cols-3 gap-3">
          <input className="input md:col-span-1" name="title" placeholder="Project title" required />
          <input className="input md:col-span-2" name="description" placeholder="One-line description" />
          <button className="btn-primary md:col-span-3">Create project</button>
        </form>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Your projects</h2>
        {projects.length === 0 ? (
          <p className="text-slate-500 text-sm">No projects yet.</p>
        ) : (
          <ul className="grid md:grid-cols-2 gap-3">
            {projects.map(p => (
              <li key={p.id} className="card p-4">
                <Link href={`/projects/${p.id}`} className="font-semibold text-brand-600 hover:underline">{p.title}</Link>
                <p className="text-sm text-slate-600 mt-1">{p.description}</p>
                <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <span>Updated {fmtDate(p.updatedAt)}</span>
                  <span>{p._count.conversations} AI conversation{p._count.conversations === 1 ? '' : 's'}</span>
                  <span className={p.status === 'SUBMITTED' ? 'text-emerald-700' : 'text-amber-700'}>{p.status}</span>
                  {p.anchor && <span className="text-emerald-700">⛓ anchored</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
