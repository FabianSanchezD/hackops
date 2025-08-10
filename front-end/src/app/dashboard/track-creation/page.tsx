"use client";

import { useMemo, useState, useEffect } from "react";
import GrowthNavbar from "../../../components/dashboard/GrowthNavbar";
import Button from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

// Three dots loading animation component
const ThreeDotsLoader = ({ text = "Generating" }: { text?: string }) => {
    const [dots, setDots] = useState('.');
    
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev === '.') return '..';
                if (prev === '..') return '...';
                return '.';
            });
        }, 500);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <span>
            {text}
            <span className="inline-block w-6 text-left">{dots}</span>
        </span>
    );
};

interface Challenge { title: string; description: string }
interface Track { name: string; objective: string; challenges: Challenge[] }
interface IdeasResponse { tracks: Track[] }
interface ItemInfo {
	meta?: { theme?: string; audience?: string; durationDays?: number; tracksCount?: number; challengesPerTrack?: number };
	tracks: Track[];
	storage?: { bucket?: string; path?: string; publicUrl?: string };
}
interface ChallengeTracksItem { id: number | string; created_at: string | null; prompt: string; created_by: string; info: ItemInfo }

export default function TrackCreationPage() {
	const [theme, setTheme] = useState("");
	const [audience, setAudience] = useState("");
	const [durationDays, setDurationDays] = useState<string>("2");
	const [tracksCount, setTracksCount] = useState<string>("4");
	const [challengesPerTrack, setChallengesPerTrack] = useState<string>("3");
	const [isGenerating, setIsGenerating] = useState(false);
	const [ideas, setIdeas] = useState<IdeasResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [myTracks, setMyTracks] = useState<ChallengeTracksItem[]>([]);
	const [tracksLoading, setTracksLoading] = useState(false);
	const [tracksError, setTracksError] = useState<string | null>(null);

	const API_URL = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

	const ensureApi = () => {
		if (!API_URL) {
			console.error('NEXT_PUBLIC_API_URL is not set');
			alert('API base URL is not configured. Please set NEXT_PUBLIC_API_URL in .env');
			return false;
		}
		return true;
	};

	const generateIdeas = async () => {
		if (!ensureApi()) return;
		setIsGenerating(true);
		setError(null);
		setIdeas(null);
		try {
			const payload = {
				theme: theme.trim() || undefined,
				audience: audience.trim() || undefined,
				durationDays: parseInt(durationDays || '') || 2,
				tracksCount: parseInt(tracksCount || '') || 4,
				challengesPerTrack: parseInt(challengesPerTrack || '') || 3,
			};
			// Save-and-generate in one step using the backend route that persists
			const res = await fetch(`${API_URL}/challenge-tracks`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || 'Failed to generate & save');
			const tracks = (data?.item?.info?.tracks || []) as Track[];
			setIdeas({ tracks });
			// refresh saved list
			await loadMyTracks();
		} catch (e: any) {
			setError(e?.message || 'Unexpected error');
		} finally {
			setIsGenerating(false);
		}
	};

	const loadMyTracks = async () => {
		if (!ensureApi()) return;
		setTracksLoading(true);
		setTracksError(null);
		try {
			const res = await fetch(`${API_URL}/challenge-tracks`, { credentials: 'include' });
			const data = (await res.json()) as { items?: ChallengeTracksItem[]; error?: string };
			if (!res.ok) throw new Error(data?.error || `Failed to load (${res.status})`);
			setMyTracks(Array.isArray(data.items) ? data.items : []);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to load tracks';
			setTracksError(msg);
		} finally {
			setTracksLoading(false);
		}
	};

	useEffect(() => {
		loadMyTracks();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [API_URL]);

	const clear = () => {
		setIdeas(null);
		setError(null);
		setTheme("");
		setAudience("");
		setDurationDays("");
		setTracksCount("");
		setChallengesPerTrack("");
	};

	// removed separate save button; Generate Ideas now saves

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0a174e] via-[#1e40af] to-[#3b82f6]">
			<GrowthNavbar />
			<main className="flex items-center justify-center p-6 pt-20">
				<div className="w-full max-w-5xl bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-8 shadow-2xl">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-[#0a174e] mb-4">Track Creation Assistant</h1>
						<p className="text-neutral-600">Generate curated tracks and concrete challenges tailored to your hackathon</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						<div>
							<label className="block text-sm font-medium text-neutral-700 mb-2">Theme</label>
							<input 
								className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] placeholder:text-neutral-400 transition-colors" 
								value={theme} 
								onChange={e => setTheme(e.target.value)} 
								placeholder="AI for Social Good" 
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-neutral-700 mb-2">Audience</label>
							<input 
								className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] placeholder:text-neutral-400 transition-colors" 
								value={audience} 
								onChange={e => setAudience(e.target.value)} 
								placeholder="students and developers" 
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-neutral-700 mb-2">Duration (days)</label>
							<input 
								className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-colors" 
								type="number" 
								min={1} 
								step={1} 
								value={durationDays} 
								onChange={e => setDurationDays(e.target.value)} 
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-neutral-700 mb-2"># Tracks</label>
							<input 
								className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-colors" 
								type="number" 
								min={1} 
								step={1} 
								value={tracksCount} 
								onChange={e => setTracksCount(e.target.value)} 
							/>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-neutral-700 mb-2"># Challenges per Track</label>
							<input 
								className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-colors" 
								type="number" 
								min={1} 
								step={1} 
								value={challengesPerTrack} 
								onChange={e => setChallengesPerTrack(e.target.value)} 
							/>
						</div>
					</div>

					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-red-700 text-sm">{error}</p>
						</div>
					)}

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
						<Button 
							onClick={generateIdeas} 
							disabled={isGenerating}
							className="px-8 py-3 min-w-[140px]"
						>
							{isGenerating ? (
								<ThreeDotsLoader key="generating" />
							) : (
								'Generate Ideas'
							)}
						</Button>
						<Button 
							onClick={clear} 
							variant="secondary" 
							disabled={isGenerating}
							className="px-8 py-3"
						>
							Clear
						</Button>
					</div>

					{/* Results */}
					{ideas?.tracks && ideas.tracks.length > 0 && (
						<div className="bg-white/50 border border-neutral-200 rounded-xl p-6 shadow-lg">
							<h2 className="text-2xl font-semibold text-[#0a174e] mb-6 text-center">Proposed Tracks</h2>
							<div className="space-y-6">
								{ideas.tracks.map((t, i) => (
									<div key={i} className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
										<div className="flex items-center justify-between mb-3">
											<div className="text-xl font-semibold text-[#0a174e]">{t.name}</div>
											<span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-[#1e40af] font-medium">
												{t.challenges?.length || 0} challenges
											</span>
										</div>
										<p className="text-neutral-700 mb-4 leading-relaxed">{t.objective}</p>
										<ul className="space-y-2">
											{t.challenges?.map((c, j) => (
												<li key={j} className="flex items-start gap-3">
													<div className="w-2 h-2 bg-[#1e40af] rounded-full mt-2 flex-shrink-0"></div>
													<div>
														<span className="font-semibold text-[#0a174e]">{c.title}:</span>{" "}
														<span className="text-neutral-700">{c.description}</span>
													</div>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</div>
					)}

				</div>
			</main>

			{/* My Tracks (saved) - separate full-width card, similar to Growth page */}
			<section className="mx-auto max-w-6xl px-6 pb-16">
				<div className="w-full bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-2xl">
					<h2 className="text-2xl font-bold text-[#0a174e] mb-4">My Tracks</h2>
					<div className="flex items-center justify-between mb-2">
						<span className="text-neutral-600 text-sm">Your saved track sets</span>
						<button onClick={loadMyTracks} disabled={tracksLoading} className="px-4 py-2 rounded-lg bg-white text-[#1e40af] border border-[#1e40af]/40 hover:bg-[#f3f7ff] transition-colors disabled:opacity-60">
							{tracksLoading ? 'Refreshing…' : 'Refresh'}
						</button>
					</div>
					{tracksError && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{tracksError}</div>}
					{myTracks.length === 0 ? (
						<p className="text-neutral-700">No tracks yet. Use Track Creation to generate and save them.</p>
					) : (
						<div className="space-y-6">
							{myTracks.map((item) => (
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
				</div>
			</section>
		</div>
	);
}
