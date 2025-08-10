"use client";

import React from "react";
import { API_BASE } from "../../../lib/api";
import GrowthNavbar from "../../../components/dashboard/GrowthNavbar";
import Button from "../../../components/ui/button";

type TeamMember = {
  id: number | string;
  name: string | null;
  email: string | null;
  phone_number: any;
  created_at: string | null;
};

export default function TeamManagementPage() {
  const [rows, setRows] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // selection + compose
  const [selectedIds, setSelectedIds] = React.useState<Array<string | number>>([]);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const selected = React.useMemo(
    () => rows.find((r) => r.id === selectedIds[0]) || null,
    [rows, selectedIds]
  );
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [aiPrompt, setAiPrompt] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const allSelectedEmails = React.useMemo(
    () => rows.filter(r => selectedIds.includes(r.id)).map(r => r.email).filter(Boolean) as string[],
    [rows, selectedIds]
  );

  // pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = (page - 1) * pageSize;
  const currentRows = rows.slice(start, start + pageSize);
  const allPageSelected = currentRows.length > 0 && currentRows.every(r => selectedIds.includes(r.id));

  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Check auth first so we can show a clear message
        const me = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!me.ok) {
          const payload = await safeJson(me);
          throw new Error(
            payload?.error ||
              `Please sign in to view your team (HTTP ${me.status}).`
          );
        }

        const res = await fetch(`${API_BASE}/team-management/my-team`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const payload = await safeJson(res);
          throw new Error(
            payload?.error ||
              `Failed to load team (HTTP ${res.status}).`
          );
        }
        const data = await res.json();
        if (active) setRows(Array.isArray(data?.team) ? data.team : []);

      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load team");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [API_BASE]);

  async function askAiForEmail() {
    try {
      setAiLoading(true);
      setToast(null);
      const res = await fetch(`${API_BASE}/team-management/ai-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt || "Outreach email to a hackathon team member",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `AI failed (HTTP ${res.status})`);
      setSubject(data.subject || "");
      setBody(data.text || "");
    } catch (e: any) {
      setToast(e?.message || "Failed to generate email");
    } finally {
      setAiLoading(false);
    }
  }

  async function sendEmail() {
    if (!selected?.email) {
      setToast("Please select a member with an email");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setToast("Subject and message are required");
      return;
    }
    try {
      setSending(true);
      setToast(null);
      const res = await fetch(`${API_BASE}/team-management/send-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selected.email, subject, text: body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Failed to send (HTTP ${res.status})`);
      setToast("Email sent");
    } catch (e: any) {
      setToast(e?.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  async function addTeamMember() {
    const name = newName.trim();
    const email = newEmail.trim();
    const phone_number = newPhone.trim() ? { number: newPhone.trim() } : null;
    if (!name || !email) { setToast('Name and email are required'); return; }
    try {
      setAdding(true);
      const res = await fetch(`${API_BASE}/team-management/team-members`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone_number }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || `Failed to add (${res.status})`);
      setRows((prev) => [...prev, data.entry]);
      setShowAddModal(false);
      setNewName(''); setNewEmail(''); setNewPhone('');
      setToast('Team member added');
    } catch (e: any) {
      setToast(e?.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  }

  async function sendBulk() {
    if (allSelectedEmails.length === 0) {
      setToast("Select at least one member with an email");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setToast("Subject and message are required");
      return;
    }
    try {
      setSending(true);
      setToast(null);
      const res = await fetch(`${API_BASE}/team-management/send-bulk`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: allSelectedEmails, subject, text: body }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 207) {
        throw new Error(data?.error || `Bulk send failed (HTTP ${res.status})`);
      }
      // 200 or 207 with summary
      const sent = data?.sent ?? 0;
      const failed = data?.failed ?? 0;
      if (failed > 0) {
        setToast(`Sent ${sent}, failed ${failed}.`);
      } else {
        setToast(`Sent ${sent} emails.`);
      }
    } catch (e: any) {
      setToast(e?.message || "Bulk send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a174e] via-[#1e40af] to-[#3b82f6]">
      <GrowthNavbar />
      <main className="flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#0a174e]">Team Management</h1>
            <Button onClick={() => setShowAddModal(true)} className="px-5 py-2">Add Team Member</Button>
          </div>

          {loading && (
            <div className="text-sm text-neutral-700">Loading team…</div>
          )}
          {error && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

          {!loading && !error && (
            <>
              <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            aria-label="Select all on page"
                            checked={allPageSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds((prev) => {
                                  const ids = new Set(prev);
                                  currentRows.forEach(r => ids.add(r.id));
                                  return Array.from(ids);
                                });
                              } else {
                                setSelectedIds((prev) => prev.filter(id => !currentRows.find(r => r.id === id)));
                              }
                            }}
                          />
                          <span>Select</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {currentRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-neutral-500 text-sm">
                          No team members yet.
                        </td>
                      </tr>
                    )}
                    {currentRows.map((r) => (
                      <tr
                        key={r.id}
                        className={`hover:bg-neutral-50/70 transition-colors ${selectedIds.includes(r.id) ? "bg-blue-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(r.id)}
                            onChange={(e) => {
                              setSelectedIds((prev) => {
                                if (e.target.checked) return Array.from(new Set([...prev, r.id]));
                                return prev.filter((id) => id !== r.id);
                              });
                            }}
                            aria-label={`Select ${r.name || r.email}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-900">{r.name || "—"}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{r.email || "—"}</td>
                        <td className="px-4 py-3 text-sm text-neutral-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="text-neutral-600">Page {page} of {totalPages}</div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                  <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                </div>
              </div>

              <div className="bg-white/80 border border-neutral-200 rounded-xl p-5 mt-6">
                <h2 className="text-xl font-semibold text-[#0a174e] mb-3">Compose Email</h2>
                {selectedIds.length === 0 && (
                  <p className="text-sm text-neutral-600">Select one or more team members to start composing an email.</p>
                )}

                {selectedIds.length > 0 && (
                  <>
                    <div className="text-sm text-neutral-700 mb-3">
                      To: {allSelectedEmails.length === 1 ? (
                        <>
                          <span className="font-medium">{selected?.name || selected?.email}</span>{" "}
                          <span className="text-neutral-500">({selected?.email || "no email"})</span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium">{allSelectedEmails.length} recipients</span>
                          <span className="text-neutral-500"> ({allSelectedEmails.slice(0,3).join(", ")}{allSelectedEmails.length>3?", …":""})</span>
                        </>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-neutral-600 mb-1">Ask AI for subject and message</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          className="flex-1 border border-neutral-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#1e40af]/70 focus:border-transparent"
                          placeholder="e.g., Follow-up about our hackathon details"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                        />
                        <Button onClick={askAiForEmail} disabled={aiLoading}>{aiLoading ? "Thinking…" : "Ask AI"}</Button>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 mb-3">
                      <div className="md:w-1/2">
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Subject</label>
                        <input
                          className="w-full border border-neutral-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#1e40af]/70 focus:border-transparent"
                          placeholder="Subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                        />
                      </div>
                      <div className="md:w-1/2">
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Message</label>
                        <textarea
                          className="w-full min-h-[120px] border border-neutral-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#1e40af]/70 focus:border-transparent"
                          placeholder="Write your message"
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                        />
                      </div>
                    </div>

                    {toast && (<div className="text-sm mb-2 text-neutral-700">{toast}</div>)}

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={sendBulk}
                        disabled={sending || !subject.trim() || !body.trim() || allSelectedEmails.length === 0}
                      >
                        {sending ? "Sending…" : `Send to Selected (${allSelectedEmails.length})`}
                      </Button>
                      <Button
                        onClick={sendEmail}
                        disabled={
                          sending ||
                          !subject.trim() ||
                          !body.trim() ||
                          !selected?.email ||
                          allSelectedEmails.length !== 1
                        }
                      >
                        {sending ? "Sending…" : "Send Single"}
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Note: Jury & Speakers moved to /dashboard/speaker-jury-management */}
            </>
          )}
        </div>
      </main>

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur rounded-2xl w-full max-w-md shadow-2xl border border-white/20">
            <div className="px-5 py-4 border-b border-neutral-200/70 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Team Member</h3>
              <button className="text-neutral-500 hover:text-neutral-700" onClick={()=>setShowAddModal(false)}>✕</button>
            </div>
            <div className="p-5 space-y-3">
              <input className="w-full border border-neutral-300 rounded-md px-3 py-2" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} />
              <input className="w-full border border-neutral-300 rounded-md px-3 py-2" placeholder="Email" value={newEmail} onChange={(e)=>setNewEmail(e.target.value)} />
              <input className="w-full border border-neutral-300 rounded-md px-3 py-2" placeholder="Phone (optional)" value={newPhone} onChange={(e)=>setNewPhone(e.target.value)} />
            </div>
            <div className="px-5 py-4 border-t border-neutral-200/70 flex justify-end gap-2">
              <Button variant="secondary" onClick={()=>setShowAddModal(false)}>Cancel</Button>
              <Button disabled={adding || !newName.trim() || !newEmail.trim()} onClick={addTeamMember}>{adding ? 'Adding…' : 'Add'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// end