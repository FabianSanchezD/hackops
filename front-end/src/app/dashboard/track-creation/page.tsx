"use client";

import { useMemo, useState } from "react";
import Navbar from "../../../components/dashboard/Navbar";
import Button from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

interface Challenge { title: string; description: string }
interface Track { name: string; objective: string; challenges: Challenge[] }
interface IdeasResponse { tracks: Track[] }

export default function TrackCreationPage() {
	const [theme, setTheme] = useState("");
	const [audience, setAudience] = useState("");
	const [durationDays, setDurationDays] = useState<string>("2");
	const [tracksCount, setTracksCount] = useState<string>("4");
	const [challengesPerTrack, setChallengesPerTrack] = useState<string>("3");
	const [isGenerating, setIsGenerating] = useState(false);
	const [ideas, setIdeas] = useState<IdeasResponse | null>(null);
	const [error, setError] = useState<string | null>(null);

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
			const res = await fetch(`${API_URL}/track-creation/ai-ideas`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || 'Failed to generate ideas');
			setIdeas(data.ideas as IdeasResponse);
		} catch (e: any) {
			setError(e?.message || 'Unexpected error');
		} finally {
			setIsGenerating(false);
		}
	};

	const clear = () => {
		setIdeas(null);
		setError(null);
		setTheme("");
		setAudience("");
		setDurationDays("");
		setTracksCount("");
		setChallengesPerTrack("");
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
			<Navbar />
			<main className="mx-auto max-w-5xl px-4 py-6 md:py-10 flex flex-col items-center">
				{/* Centered hero card */}
				<Card className="w-full max-w-3xl border-neutral-200 shadow-sm">
					<CardContent className="p-5 md:p-7">
						<div className="text-center mb-4 md:mb-6">
							<h1 className="text-2xl md:text-3xl font-bold text-[#1e40af]">Track Creation Assistant</h1>
							<p className="text-neutral-600 mt-2">Generate curated tracks and concrete challenges tailored to your hackathon.</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-2">Theme</label>
								<input className="w-full p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#1e40af]/70 focus:border-transparent placeholder:text-neutral-400" value={theme} onChange={e => setTheme(e.target.value)} placeholder="AI for Social Good" />
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-2">Audience</label>
								<input className="w-full p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#1e40af]/70 focus:border-transparent placeholder:text-neutral-400" value={audience} onChange={e => setAudience(e.target.value)} placeholder="students and developers" />
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-2">Duration (days)</label>
								<input className="w-full p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#1e40af]/70 focus:border-transparent" type="number" min={1} step={1} value={durationDays} onChange={e => setDurationDays(e.target.value)} />
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-2"># Tracks</label>
								<input className="w-full p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#1e40af]/70 focus:border-transparent" type="number" min={1} step={1} value={tracksCount} onChange={e => setTracksCount(e.target.value)} />
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-neutral-700 mb-2"># Challenges per Track</label>
								<input className="w-full p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#1e40af]/70 focus:border-transparent" type="number" min={1} step={1} value={challengesPerTrack} onChange={e => setChallengesPerTrack(e.target.value)} />
							</div>
						</div>

						{error && (
							<div className="mt-3 text-sm text-red-600">{error}</div>
						)}

						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 justify-center">
							<Button onClick={generateIdeas} disabled={isGenerating}>
								{isGenerating ? 'Generating…' : 'Generate Ideas'}
							</Button>
							<Button onClick={clear} variant="secondary" disabled={isGenerating}>Clear</Button>
						</div>
					</CardContent>
				</Card>

				{/* Results */}
				{ideas?.tracks && ideas.tracks.length > 0 && (
					<Card className="w-full max-w-3xl border-neutral-200 mt-6 shadow">
						<CardContent className="p-5 md:p-7">
							<h2 className="text-xl font-semibold mb-3">Proposed Tracks</h2>
							<div className="space-y-4">
								{ideas.tracks.map((t, i) => (
									<div key={i} className="rounded-lg border p-4">
										<div className="flex items-center justify-between">
											<div className="text-lg font-semibold text-neutral-900">{t.name}</div>
											<span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{t.challenges?.length || 0} challenges</span>
										</div>
										<p className="text-sm text-neutral-700 mt-1">{t.objective}</p>
										<ul className="list-disc pl-5 mt-3 space-y-1">
											{t.challenges?.map((c, j) => (
												<li key={j}><span className="font-medium">{c.title}:</span> {c.description}</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	);
}
