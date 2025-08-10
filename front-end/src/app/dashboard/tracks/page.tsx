'use client';

import { useEffect, useMemo, useState } from 'react';

type Challenge = { title: string; description: string };
type Track = { name: string; objective: string; challenges: Challenge[] };
type ItemInfo = {
  meta?: { theme?: string; audience?: string; durationDays?: number; tracksCount?: number; challengesPerTrack?: number };
  tracks: Track[];
  storage?: { bucket?: string; path?: string; publicUrl?: string };
};
type ChallengeTracksItem = { id: number | string; created_at: string | null; prompt: string; created_by: string; info: ItemInfo };

export default function TracksPage() {
  const API_URL = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

  const [theme, setTheme] = useState('AI & Impact');
  const [audience, setAudience] = useState('students and professionals');
  const [durationDays, setDurationDays] = useState(2);
  const [tracksCount, setTracksCount] = useState(4);
  const [challengesPerTrack, setChallengesPerTrack] = useState(3);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ChallengeTracksItem[]>([]);

  const ensureApi = () => {
    if (!API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not set');
      alert('API base URL is not configured. Please set NEXT_PUBLIC_API_URL in .env');
      return false;
    }
    return true;
  };

  async function loadItems() {
    if (!ensureApi()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/challenge-tracks`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Failed to load (${res.status})`);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tracks');
    } finally {
      setLoading(false);
    }
  }

  async function createTracks() {
    if (!ensureApi()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/challenge-tracks`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, audience, durationDays, tracksCount, challengesPerTrack }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Create failed (${res.status})`);
      await loadItems();
    } catch (e: any) {
      setError(e?.message || 'Failed to create tracks');
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => { loadItems(); }, [API_URL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a174e] via-[#1e40af] to-[#3b82f6]">
      <main className="flex items-center justify-center p-6 pt-20">
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0a174e] mb-2">Challenge Tracks</h1>
            <p className="text-neutral-600">Generate and view your saved hackathon tracks</p>
          </div>

          {/* Creator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Theme</label>
              <input className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white/50" value={theme} onChange={e => setTheme(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Audience</label>
              <input className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white/50" value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Duration (days)</label>
              <input type="number" min={1} className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white/50" value={durationDays} onChange={e => setDurationDays(parseInt(e.target.value || '0', 10))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Tracks</label>
                <input type="number" min={1} className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white/50" value={tracksCount} onChange={e => setTracksCount(parseInt(e.target.value || '0', 10))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Challenges / Track</label>
                <input type="number" min={1} className="w-full border border-neutral-300 rounded-lg px-3 py-2 bg-white/50" value={challengesPerTrack} onChange={e => setChallengesPerTrack(parseInt(e.target.value || '0', 10))} />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>
          )}

          <div className="flex gap-3 mb-8">
            <button onClick={createTracks} disabled={creating} className="px-6 py-3 rounded-lg bg-[#1e40af] text-white hover:bg-[#16358f] transition-colors disabled:opacity-60">
              {creating ? 'Generating…' : 'Generate & Save Tracks'}
            </button>
            <button onClick={loadItems} disabled={loading} className="px-6 py-3 rounded-lg bg-white text-[#1e40af] border border-[#1e40af]/40 hover:bg-[#f3f7ff] transition-colors disabled:opacity-60">Refresh</button>
          </div>

          {/* List */}
          <section className="w-full bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#0a174e] mb-4">My Tracks</h2>
            {loading ? (
              <p className="text-neutral-700">Loading…</p>
            ) : items.length === 0 ? (
              <p className="text-neutral-700">No tracks yet. Generate to save and see them here.</p>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-neutral-200 p-4 shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <div>
                        <div className="text-sm text-neutral-500">{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</div>
                        <div className="text-neutral-800 font-medium">{item.info?.meta?.theme || item.prompt}</div>
                      </div>
                      {item.info?.storage?.publicUrl && (
                        <a className="text-sm text-[#1e40af] hover:underline" href={item.info.storage.publicUrl} target="_blank" rel="noreferrer">View JSON</a>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(item.info?.tracks) && item.info.tracks.map((t, idx) => (
                        <div key={idx} className="border border-neutral-200 rounded-lg p-3">
                          <div className="font-semibold text-neutral-900">{t.name}</div>
                          <div className="text-sm text-neutral-700 mb-2">{t.objective}</div>
                          {Array.isArray(t.challenges) && t.challenges.length > 0 && (
                            <ul className="list-disc pl-5 space-y-1 text-sm text-neutral-800">
                              {t.challenges.map((c, i) => (
                                <li key={i}>
                                  <span className="font-medium">{c.title}</span>
                                  {c.description ? ` — ${c.description}` : ''}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
