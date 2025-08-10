"use client";

import React, { useEffect, useMemo, useState } from "react";
import GrowthNavbar from "../../../components/dashboard/GrowthNavbar";
import Button from "../../../components/ui/button";

type Todo = {
  id?: string | number;
  title: string;
  status: "doing" | "done";
};

export default function TodosAgendaPage() {
  const API_URL = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDoneTasks, setShowDoneTasks] = useState(false);

  const activeTodos = todos.filter(t => t.status === "doing");
  const doneTodos = todos.filter(t => t.status === "done");

  function ensureApi(): string | null {
    if (!API_URL) {
      setError("API base URL not configured");
      return null;
    }
    return API_URL;
  }

  async function load() {
    const base = ensureApi();
    if (!base) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${base}/todos-agenda`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Failed to load (${res.status})`);
      const list: Todo[] = Array.isArray(data.todos) ? data.todos : [];
      setTodos(list);
      // hydrate + ensure every task has a tag (client-only)
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('agentByTask');
        let stored: Record<string, "growth_post_builder" | "challenge_builder"> = {};
        if (raw) {
          try { stored = JSON.parse(raw) || {}; } catch { stored = {}; }
        }
        const merged: Record<string, "growth_post_builder" | "challenge_builder"> = { ...stored };
        for (const t of list) {
          const key = String(t.id ?? `${t.title}`);
          if (!merged[key]) merged[key] = pickDefaultAgent(t.title);
        }
        setAgentByTask(merged);
        localStorage.setItem('agentByTask', JSON.stringify(merged));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }

  async function save(updated: Todo[]) {
    const base = ensureApi();
    if (!base) return;
    try {
      const res = await fetch(`${base}/todos-agenda`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todos: updated }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Failed to save (${res.status})`);
      const saved = Array.isArray(data.todos) ? data.todos : updated;
      setTodos(saved);
      return saved;
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    }
  }

  useEffect(() => { load(); }, []);

  function move(id: Todo["id"], to: Todo["status"]) {
    setTodos(prev => {
      const next = prev.map(t => t.id === id ? { ...t, status: to } : t);
      // Persist asynchronously
      save(next);
      return next;
    });
  }

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAgentKey, setNewAgentKey] = useState<"growth_post_builder" | "challenge_builder">("growth_post_builder");
  const [agentByTask, setAgentByTask] = useState<Record<string, "growth_post_builder" | "challenge_builder">>({});

  // Choose a default agent for display when none was explicitly selected (UI-only)
  function pickDefaultAgent(title: string): "growth_post_builder" | "challenge_builder" {
    const t = (title || '').toLowerCase();
    if (t.includes('challenge') || t.includes('jury') || t.includes('track')) return 'challenge_builder';
    return 'growth_post_builder';
  }

  const AGENTS: { key: "growth_post_builder" | "challenge_builder"; label: string; href: string }[] = [
    { key: "growth_post_builder", label: "Growth Builder", href: "/dashboard/growth" },
    { key: "challenge_builder", label: "Challenge Builder", href: "/dashboard/track-creation" },
  ];

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const base = ensureApi();
    if (!base) return;
    const payload = { title: newTitle.trim(), status: "doing" } as any;
    try {
      const res = await fetch(`${base}/todos-agenda`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todo: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Failed to create (${res.status})`);
      const created: Todo[] = Array.isArray(data.todos) ? data.todos : [];
      const next = [...todos, ...created];
      setTodos(next);
      // map created id -> selected agent key locally
      const createdId = created[0]?.id;
      if (createdId != null) {
        const mapNext = { ...agentByTask, [String(createdId)]: newAgentKey } as Record<string, "growth_post_builder" | "challenge_builder">;
        setAgentByTask(mapNext);
        if (typeof window !== 'undefined') localStorage.setItem('agentByTask', JSON.stringify(mapNext));
      }
      setIsModalOpen(false);
      setNewTitle("");
      setNewAgentKey("growth_post_builder");
    } catch (err: any) {
      setError(err?.message || 'Failed to create');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a174e] via-[#1e40af] to-[#3b82f6]">
      <GrowthNavbar />
      <main className="p-6 pt-20">
        <div className="mx-auto max-w-4xl bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#0a174e]">Todos & Agenda</h1>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={load} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</Button>
              <Button onClick={() => setIsModalOpen(true)}>+ Add Task</Button>
            </div>
          </div>
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-semibold text-[#0a174e] mb-4">Add a new task</h3>
                <form onSubmit={submitNew} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                    <input
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g. Create your first post on LinkedIn"
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Agent</label>
                    <select
                      value={newAgentKey}
                      onChange={e => setNewAgentKey(e.target.value as any)}
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1e40af]/30"
                    >
                      {AGENTS.map(a => (
                        <option key={a.key} value={a.key}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setIsModalOpen(false); setNewTitle(""); }} className="px-3 py-2 text-sm text-neutral-700 hover:underline">Cancel</button>
                    <Button type="submit">Add</Button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Active Tasks */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0a174e] mb-4">Current Tasks</h2>
            <div className="space-y-3">
              {activeTodos.map(t => {
                const agentKey = agentByTask[String(t.id ?? '')] || pickDefaultAgent(t.title);
                const agent = agentKey ? AGENTS.find(a => a.key === agentKey) : undefined;
                return (
                  <div key={String(t.id ?? `${t.title}`)} className="border border-neutral-200 rounded-lg p-4 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Doing</span>
                      <span className="text-neutral-900">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {agent && (
                        <a href={agent.href} className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200">
                          {agent.label}
                        </a>
                      )}
                      <button onClick={() => move(t.id, "done")} className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200">
                        Mark Done
                      </button>
                    </div>
                  </div>
                );
              })}
              {activeTodos.length === 0 && (
                <div className="text-sm text-neutral-500 text-center py-8">No active tasks. Add one to get started!</div>
              )}
            </div>
          </div>

          {/* Done Tasks Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0a174e]">Done Tasks ({doneTodos.length})</h2>
              <button onClick={() => setShowDoneTasks(!showDoneTasks)} className="text-sm text-[#1e40af] hover:underline">
                {showDoneTasks ? "Hide" : "View"} Done Tasks
              </button>
            </div>
            {showDoneTasks && (
              <div className="space-y-2">
                {doneTodos.map(t => {
                  const agentKey = agentByTask[String(t.id ?? '')] || pickDefaultAgent(t.title);
                  const agent = agentKey ? AGENTS.find(a => a.key === agentKey) : undefined;
                  return (
                    <div key={String(t.id ?? `${t.title}`)} className="border border-neutral-200 rounded-lg p-3 bg-neutral-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Done</span>
                        <span className="text-neutral-700 line-through">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {agent && (
                          <a href={agent.href} className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200">
                            {agent.label}
                          </a>
                        )}
                        <button onClick={() => move(t.id, "doing")} className="px-2 py-1 text-xs text-blue-600 hover:underline">
                          Undo
                        </button>
                      </div>
                    </div>
                  );
                })}
                {doneTodos.length === 0 && (
                  <div className="text-sm text-neutral-500 text-center py-4">No completed tasks yet.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
