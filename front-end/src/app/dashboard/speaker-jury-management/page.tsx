"use client";

import React from "react";
import Navbar from "../../../components/dashboard/Navbar";
import { Card, CardContent } from "../../../components/ui/card";
import Button from "../../../components/ui/button";

type Person = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone_number: any;
  created_at: string | null;
};

export default function SpeakerJuryManagementPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Jury state
  const [jury, setJury] = React.useState<Person[]>([]);
  const [jurySelected, setJurySelected] = React.useState<Array<string | number>>([]);
  const [juryPage, setJuryPage] = React.useState(1);
  const pageSize = 10;
  const juryTotalPages = Math.max(1, Math.ceil(jury.length / pageSize));
  const juryStart = (juryPage - 1) * pageSize;
  const juryRows = jury.slice(juryStart, juryStart + pageSize);
  const juryAllSelected = juryRows.length>0 && juryRows.every(r => jurySelected.includes(r.id));

  // Speakers state
  const [speakers, setSpeakers] = React.useState<Person[]>([]);
  const [speakerSelected, setSpeakerSelected] = React.useState<Array<string | number>>([]);
  const [speakerPage, setSpeakerPage] = React.useState(1);
  const speakerTotalPages = Math.max(1, Math.ceil(speakers.length / pageSize));
  const speakerStart = (speakerPage - 1) * pageSize;
  const speakerRows = speakers.slice(speakerStart, speakerStart + pageSize);
  const speakersAllSelected = speakerRows.length>0 && speakerRows.every(r => speakerSelected.includes(r.id));

  // Compose + AI per section (shared state for simplicity)
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  // Modals for add
  const [showAddJury, setShowAddJury] = React.useState(false);
  const [showAddSpeaker, setShowAddSpeaker] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        // Auth check
        const me = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (!me.ok) {
          setToast("Please sign in to manage jury and speakers.");
          return;
        }
        const r1 = await fetch(`${API_BASE}/team-management/jury`, { credentials: "include" });
        const d1 = await safeJson(r1);
        if (r1.ok && active) setJury(Array.isArray(d1?.jury) ? d1.jury : []);
        const r2 = await fetch(`${API_BASE}/team-management/speakers`, { credentials: "include" });
        const d2 = await safeJson(r2);
        if (r2.ok && active) setSpeakers(Array.isArray(d2?.speakers) ? d2.speakers : []);
      } catch {}
    }
    load();
    return () => { active = false; }
  }, [API_BASE]);

  async function askAi() {
    try {
      setAiLoading(true);
      setToast(null);
      const res = await fetch(`${API_BASE}/team-management/ai-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt || 'Outreach email for jury/speakers' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `AI failed (${res.status})`);
      setSubject(data.subject || "");
      setBody(data.text || "");
    } catch (e: any) {
      setToast(e?.message || 'Failed to generate email');
    } finally {
      setAiLoading(false);
    }
  }

  async function sendBulk(to: string[]) {
    if (to.length === 0) { setToast('Select at least one recipient'); return; }
    if (!subject.trim() || !body.trim()) { setToast('Subject and message are required'); return; }
    try {
      setSending(true);
      setToast(null);
      const res = await fetch(`${API_BASE}/team-management/send-bulk`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text: body }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 207) throw new Error(data?.error || `Bulk send failed (${res.status})`);
      const sent = data?.sent ?? 0; const failed = data?.failed ?? 0;
      setToast(failed>0 ? `Sent ${sent}, failed ${failed}.` : `Sent ${sent} emails.`);
    } catch (e: any) {
      setToast(e?.message || 'Bulk send failed');
    } finally {
      setSending(false);
    }
  }

  async function addEntry(table: 'jury' | 'speakers') {
    const name = newName.trim();
    const email = newEmail.trim();
    const phone_number = newPhone.trim() ? { number: newPhone.trim() } : null;
    if (!name || !email) { setToast('Name and email are required'); return; }
    try {
      setAdding(true);
      const res = await fetch(`${API_BASE}/team-management/${table}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone_number }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Failed to add (${res.status})`);
      if (table === 'jury') setJury(prev => [...prev, data.entry]); else setSpeakers(prev => [...prev, data.entry]);
      setShowAddJury(false); setShowAddSpeaker(false);
      setNewName(''); setNewEmail(''); setNewPhone('');
      setToast(`${table === 'jury' ? 'Jury member' : 'Speaker'} added`);
    } catch (e: any) {
      setToast(e?.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  }

  const juryEmails = React.useMemo(()=> jury.filter(r=>jurySelected.includes(r.id)).map(r=>r.email).filter(Boolean) as string[], [jury, jurySelected]);
  const speakerEmails = React.useMemo(()=> speakers.filter(r=>speakerSelected.includes(r.id)).map(r=>r.email).filter(Boolean) as string[], [speakers, speakerSelected]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="p-5 md:py-7 md:px-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e40af]">Speakers & Jury</h1>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={()=>setShowAddJury(true)}>Add Jury</Button>
                <Button onClick={()=>setShowAddSpeaker(true)}>Add Speaker</Button>
              </div>
            </div>

            {toast && <div className="text-sm mb-2 text-neutral-700">{toast}</div>}

            {/* Jury table */}
            <h2 className="text-xl font-semibold text-[#1e40af] mb-2">Jury</h2>
            <Table
              rows={juryRows}
              allPageSelected={juryAllSelected}
              onToggleAll={(checked)=>{
                setJurySelected(prev=> checked ? Array.from(new Set([...prev, ...juryRows.map(r=>r.id)])) : prev.filter(id => !juryRows.find(r=>r.id===id)));
              }}
              selectedIds={jurySelected}
              setSelectedIds={setJurySelected}
            />
            <Pager page={juryPage} totalPages={juryTotalPages} onPrev={()=>setJuryPage(p=>Math.max(1,p-1))} onNext={()=>setJuryPage(p=>Math.min(juryTotalPages,p+1))} />

            {/* Speakers table */}
            <h2 className="text-xl font-semibold text-[#1e40af] mt-8 mb-2">Speakers</h2>
            <Table
              rows={speakerRows}
              allPageSelected={speakersAllSelected}
              onToggleAll={(checked)=>{
                setSpeakerSelected(prev=> checked ? Array.from(new Set([...prev, ...speakerRows.map(r=>r.id)])) : prev.filter(id => !speakerRows.find(r=>r.id===id)));
              }}
              selectedIds={speakerSelected}
              setSelectedIds={setSpeakerSelected}
            />
            <Pager page={speakerPage} totalPages={speakerTotalPages} onPrev={()=>setSpeakerPage(p=>Math.max(1,p-1))} onNext={()=>setSpeakerPage(p=>Math.min(speakerTotalPages,p+1))} />

            {/* Composer */}
            <div className="bg-white border border-neutral-200 rounded-lg p-4 mt-6">
              <h2 className="text-lg font-semibold text-[#1e40af] mb-3">Compose Email</h2>
              <div className="mb-3">
                <label className="block text-xs font-medium text-neutral-600 mb-1">Ask AI for subject and message</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input className="flex-1 border border-neutral-300 rounded-md px-3 py-2" placeholder="e.g., invite to speak/judge" value={aiPrompt} onChange={(e)=>setAiPrompt(e.target.value)} />
                  <Button onClick={askAi} disabled={aiLoading}>{aiLoading? 'Thinking…':'Ask AI'}</Button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3 mb-3">
                <div className="md:w-1/2">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Subject</label>
                  <input className="w-full border border-neutral-300 rounded-md px-3 py-2" value={subject} onChange={(e)=>setSubject(e.target.value)} />
                </div>
                <div className="md:w-1/2">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Message</label>
                  <textarea className="w-full min-h-[120px] border border-neutral-300 rounded-md px-3 py-2" value={body} onChange={(e)=>setBody(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" disabled={sending || juryEmails.length===0 && speakerEmails.length===0} onClick={()=>sendBulk([...juryEmails, ...speakerEmails])}>{sending? 'Sending…':'Send to Selected'}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add modals */}
      {(showAddJury || showAddSpeaker) && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-lg border border-neutral-200">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{showAddJury ? 'Add Jury' : 'Add Speaker'}</h3>
              <button className="text-neutral-500 hover:text-neutral-700" onClick={()=>{ setShowAddJury(false); setShowAddSpeaker(false); }}>✕</button>
            </div>
            <div className="p-5 space-y-3">
              <input className="w-full border border-neutral-300 rounded-md px-3 py-2" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} />
              <input className="w-full border border-neutral-300 rounded-md px-3 py-2" placeholder="Email" value={newEmail} onChange={(e)=>setNewEmail(e.target.value)} />
              <input className="w-full border border-neutral-300 rounded-md px-3 py-2" placeholder="Phone (optional)" value={newPhone} onChange={(e)=>setNewPhone(e.target.value)} />
            </div>
            <div className="px-5 py-4 border-t border-neutral-200 flex justify-end gap-2">
              <Button variant="secondary" onClick={()=>{ setShowAddJury(false); setShowAddSpeaker(false); }}>Cancel</Button>
              <Button disabled={adding || !newName.trim() || !newEmail.trim()} onClick={()=>addEntry(showAddJury? 'jury':'speakers')}>{adding? 'Adding…':'Add'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Table({ rows, selectedIds, setSelectedIds, allPageSelected, onToggleAll }: { rows: Person[]; selectedIds: Array<string|number>; setSelectedIds: (fn: (prev: Array<string|number>) => Array<string|number>)=>void; allPageSelected: boolean; onToggleAll: (checked: boolean)=>void; }) {
  return (
    <div className="overflow-x-auto border border-neutral-200 rounded-lg bg-white">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50/80">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">
              <div className="flex items-center gap-2">
                <input type="checkbox" aria-label="Select all on page" checked={allPageSelected} onChange={(e)=>onToggleAll(e.target.checked)} />
                <span>Select</span>
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">Email</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">Added</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-neutral-500 text-sm">No people yet.</td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className={`hover:bg-neutral-50 ${selectedIds.includes(r.id) ? 'bg-blue-50/50' : ''}`}>
              <td className="px-4 py-3 text-sm">
                <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e)=>{
                  setSelectedIds(prev => e.target.checked ? Array.from(new Set([...prev, r.id])) : prev.filter(id => id !== r.id));
                }} aria-label={`Select ${r.name || r.email}`} />
              </td>
              <td className="px-4 py-3 text-sm text-neutral-900">{r.name || '—'}</td>
              <td className="px-4 py-3 text-sm text-neutral-700">{r.email || '—'}</td>
              <td className="px-4 py-3 text-sm text-neutral-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pager({ page, totalPages, onPrev, onNext }: { page: number; totalPages: number; onPrev: ()=>void; onNext: ()=>void }) {
  return (
    <div className="flex items-center justify-between mt-3 text-sm">
      <div className="text-neutral-600">Page {page} of {totalPages}</div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onPrev} disabled={page===1}>Prev</Button>
        <Button onClick={onNext} disabled={page===totalPages}>Next</Button>
      </div>
    </div>
  );
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}