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
		</div>
	);
}
