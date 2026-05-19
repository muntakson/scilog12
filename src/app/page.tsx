import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">A science portal built for curious students.</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Plan an experiment with AI. Generate 3D-printable parts. Buy electronics, biology and chemistry supplies.
          Keep a tamper-proof logbook anchored to the blockchain — ready for your university interview.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/register" className="btn-primary">Start a project</Link>
          <Link href="/shop" className="btn-ghost">Browse the shop</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { t: 'AI workbench', d: 'Brainstorm with Claude, Gemini, GROQ, or DeepSeek. Every prompt and reply is saved.' },
          { t: '3D-printable STL', d: 'Describe your apparatus; get an OpenSCAD-backed STL to print on a hobby printer.' },
          { t: 'Parts shop',     d: 'Arduino, sensors, filament, petri dishes, pH strips — checkout with Stripe.' },
          { t: 'Verified logbook', d: 'SHA-256 of your logbook + chat is anchored on Base Sepolia. Interviewers can verify.' },
        ].map(f => (
          <div key={f.t} className="card p-4">
            <h3 className="font-semibold">{f.t}</h3>
            <p className="text-sm text-slate-600 mt-1">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Example: Don, Year 8 — “Brachistochrone curve race”</h2>
        <ol className="mt-3 list-decimal pl-6 space-y-1 text-sm text-slate-700">
          <li>Don asks AI to design 5 brachistochrone slides (line, circle, parabola, two cycloids) and gets OpenSCAD code.</li>
          <li>He prints the slides, then buys an Arduino, two Hall sensors, jumper wires, and a magnetic steel ball from the scilog12 shop.</li>
          <li>He uses AI to generate the Arduino sketch and an Android companion app for data logging.</li>
          <li>He fills in the logbook: introduction, materials, procedure, results, discussion, conclusion, acknowledgments, references.</li>
          <li>On submit, the logbook + full AI conversation history is hashed and anchored on Base Sepolia.</li>
          <li>He shares an interview link with a university admissions officer who can verify the hash and read every prompt.</li>
        </ol>
      </section>
    </div>
  );
}
