'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import GrowthNavbar from '../../../components/dashboard/GrowthNavbar';
import { API_BASE } from '../../../lib/api';
import Button from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';

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

interface PostResponse {
    success: boolean;
    message: string;
    image: string;
    originalPrompt: string;
    enhancedPrompt: string;
}

interface DescriptionResponse {
    success: boolean;
    message: string;
    description: string;
}

type GrowthImage = {
    id: number | string;
    link: string;
    description: string | null;
    prompt: string;
    created_at: string | null;
};

export default function GrowthPage() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingPost, setIsGeneratingPost] = useState(false);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [generatedPost, setGeneratedPost] = useState<PostResponse | null>(null);
    const [generatedDescription, setGeneratedDescription] = useState<DescriptionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showShareOverlay, setShowShareOverlay] = useState(false);
    const [saving, setSaving] = useState(false);
    const [myImages, setMyImages] = useState<GrowthImage[]>([]);

    const API_URL = useMemo(() => process.env.NEXT_PUBLIC_API_URL || API_BASE, []);

    const ensureApi = () => {
        if (!API_URL) {
            console.error('NEXT_PUBLIC_API_URL is not set');
            alert('API base URL is not configured. Please set NEXT_PUBLIC_API_URL in .env');
            return false;
        }
        return true;
    };

    const generatePost = async () => {
        if (!prompt.trim() || !ensureApi()) return;
        setIsGeneratingPost(true);
            setError(null);
        try {
            const response = await fetch(`${API_URL}/growth/create-post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
                if (!response.ok) throw new Error(`Image generation failed (${response.status})`);
            const data: PostResponse = await response.json();
            setGeneratedPost(data);
        } catch (error) {
                console.error('Error generating post:', error);
                setError('Failed to generate image.');
        } finally {
            setIsGeneratingPost(false);
        }
    };

    const generateDescription = async () => {
        if (!prompt.trim() || !ensureApi()) return;
        setIsGeneratingDesc(true);
            setError(null);
        try {
            const response = await fetch(`${API_URL}/growth/create-description`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
                if (!response.ok) throw new Error(`Description generation failed (${response.status})`);
            const data: DescriptionResponse = await response.json();
            setGeneratedDescription(data);
        } catch (error) {
                console.error('Error generating description:', error);
                setError('Failed to generate description.');
        } finally {
            setIsGeneratingDesc(false);
        }
    };

        // Generate both in parallel and show a combined preview
        const generateBoth = async () => {
            if (!prompt.trim() || !ensureApi()) return;
            setIsGenerating(true);
            setError(null);
            try {
                const [postRes, descRes] = await Promise.all([
                    fetch(`${API_URL}/growth/create-post`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt }),
                    }),
                    fetch(`${API_URL}/growth/create-description`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt }),
                    })
                ]);

                if (!postRes.ok) throw new Error(`Image generation failed (${postRes.status})`);
                if (!descRes.ok) throw new Error(`Description generation failed (${descRes.status})`);

                const [post, desc] = await Promise.all([postRes.json(), descRes.json()]);
                setGeneratedPost(post);
                setGeneratedDescription(desc);
            } catch (err: any) {
                console.error('Error generating both:', err);
                setError(err?.message || 'Failed to generate content.');
            } finally {
                setIsGenerating(false);
            }
        };

    // Save to Supabase (create + upload) and refresh gallery
    const generateAndSave = async () => {
        if (!prompt.trim() || !ensureApi()) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/growth-images`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, enhance: true, withDescription: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || `Save failed (${res.status})`);
            // Push to gallery
            await loadMyImages();
            // Update local preview
            setGeneratedPost({
              success: true,
              message: 'Saved',
              image: data?.image?.link,
              originalPrompt: prompt,
              enhancedPrompt: data?.image?.prompt || prompt,
            });
            setGeneratedDescription({ success: true, message: 'Saved', description: data?.image?.description || '' });
        } catch (e: any) {
            setError(e?.message || 'Failed to save image');
        } finally {
            setSaving(false);
        }
    };

    async function loadMyImages() {
        if (!ensureApi()) return;
        try {
            const res = await fetch(`${API_URL}/growth-images`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok) setMyImages(Array.isArray(data?.images) ? data.images : []);
        } catch {}
    }

    useEffect(() => { loadMyImages(); }, [API_URL]);

    // Sharing helpers
    const shareData = () => {
        const text = generatedDescription?.description || '';
        const url = generatedPost?.image || '';
        return { text, url };
    };

    const shareNative = async () => {
        const { text, url } = shareData();
        if (navigator.share) {
            try {
                await navigator.share({ title: 'HackOps', text, url: url || undefined });
            } catch { /* canceled */ }
        } else {
            shareToX();
        }
    };

    const openShare = (u: string) => window.open(u, '_blank');

    const shareToX = () => {
        const { text, url } = shareData();
        const link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}${url ? `&url=${encodeURIComponent(url)}` : ''}`;
        openShare(link);
    };

    const shareToLinkedIn = () => {
        const { url } = shareData();
        const link = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || 'https://hackops.app')}`;
        openShare(link);
    };

    const shareToFacebook = () => {
        const { text, url } = shareData();
        const link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || 'https://hackops.app')}&quote=${encodeURIComponent(text)}`;
        openShare(link);
    };

    const shareToReddit = () => {
        const { text, url } = shareData();
        const link = `https://www.reddit.com/submit?url=${encodeURIComponent(url || 'https://hackops.app')}&title=${encodeURIComponent(text.slice(0, 300))}`;
        openShare(link);
    };

    const shareToWhatsApp = () => {
        const { text, url } = shareData();
        const payload = `${text}${url ? ` ${url}` : ''}`;
        const link = `https://wa.me/?text=${encodeURIComponent(payload)}`;
        openShare(link);
    };

    const shareToTelegram = () => {
        const { text, url } = shareData();
        const link = `https://t.me/share/url?url=${encodeURIComponent(url || '')}&text=${encodeURIComponent(text)}`;
        openShare(link);
    };

    const shareToDiscord = () => {
        const { text, url } = shareData();
        // Discord doesn't have a direct share URL, so we'll copy to clipboard with a message
        const payload = `${text}${url ? ` ${url}` : ''}`;
        navigator.clipboard.writeText(payload);
        alert('Content copied to clipboard! You can now paste it in Discord.');
    };

        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a174e] via-[#1e40af] to-[#3b82f6]">
                <GrowthNavbar />
                <main className="flex items-center justify-center p-6 pt-20">
                    <div className="w-full max-w-4xl bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-[#0a174e] mb-4">Growth Assistant</h1>
                            <p className="text-neutral-600">Generate compelling post images and descriptions from one prompt</p>
                        </div>

                        <div className="mb-8">
                            <label htmlFor="prompt" className="block text-sm font-medium text-neutral-700 mb-3">
                                Your prompt
                            </label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Announce our global AI hackathon with prizes and mentorship"
                                className="w-full border border-neutral-300 rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all duration-200 bg-white/50 min-h-[120px] resize-none"
                                rows={4}
                            />
                        </div>

                        {error && (
                            <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <Button 
                                onClick={generateAndSave} 
                                disabled={saving || !prompt.trim()}
                                className="px-8 py-3 min-w-[140px]"
                            >
                                {saving ? (
                                    <ThreeDotsLoader key="generating" text="Saving" />
                                ) : (
                                    'Generate Both'
                                )}
                            </Button>
                            <Button 
                                onClick={generatePost} 
                                disabled={isGenerating || isGeneratingPost || isGeneratingDesc || !prompt.trim()} 
                                variant="secondary"
                                className="px-8 py-3 min-w-[120px]"
                            >
                                {isGeneratingPost ? (
                                    <ThreeDotsLoader text="Creating" key="creating" />
                                ) : (
                                    'Image Only'
                                )}
                            </Button>
                            <Button 
                                onClick={generateDescription} 
                                disabled={isGenerating || isGeneratingPost || isGeneratingDesc || !prompt.trim()} 
                                variant="secondary"
                                className="px-8 py-3 min-w-[170px]"
                            >
                                {isGeneratingDesc ? (
                                    <ThreeDotsLoader text="Writing" key="writing" />
                                ) : (
                                    'Description Only'
                                )}
                            </Button>
                            {/* Unified with Generate Both above */}
                        </div>

                        {/* Image only preview */}
                        {generatedPost && !generatedDescription && (
                            <div className="bg-white/50 border border-neutral-200 rounded-xl p-6 shadow-lg">
                                <div className="flex flex-col items-center">
                                    <a href={generatedPost.image} target="_blank" rel="noreferrer" className="block mb-4">
                                        <img 
                                            src={generatedPost.image} 
                                            alt="Generated post" 
                                            className="w-full max-w-md rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200" 
                                        />
                                    </a>
                                    <p className="text-neutral-600 text-sm mb-4">Image generated successfully! Generate a description to complete your post.</p>
                                </div>
                            </div>
                        )}

                        {/* Description only preview */}
                        {!generatedPost && generatedDescription && (
                            <div className="bg-white/50 border border-neutral-200 rounded-xl p-6 shadow-lg">
                                <div className="flex flex-col items-center">
                                    <div className="bg-white rounded-lg p-6 border border-neutral-200 mb-4 w-full max-w-2xl">
                                        <h3 className="text-lg font-semibold text-neutral-800 mb-3 text-center">Generated Description</h3>
                                        <p className="text-neutral-800 leading-relaxed whitespace-pre-wrap">{generatedDescription.description}</p>
                                    </div>
                                    <p className="text-neutral-600 text-sm mb-4">Description generated successfully! Generate an image to complete your post.</p>
                                    <div className="flex items-center justify-center">
                                        <Button 
                                            onClick={() => setShowShareOverlay(true)}
                                            className="px-8 py-3 min-w-[140px]"
                                        >
                                            Share Description
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Combined preview */}
                        {generatedPost && generatedDescription && (
                            <div className="bg-white/50 border border-neutral-200 rounded-xl p-6 shadow-lg">
                                <div className="flex flex-col items-center">
                                    <a href={generatedPost.image} target="_blank" rel="noreferrer" className="block mb-6">
                                        <img 
                                            src={generatedPost.image} 
                                            alt="Generated post" 
                                            className="w-full max-w-md rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200" 
                                        />
                                    </a>
                                    <div className="bg-white rounded-lg p-6 border border-neutral-200 mb-6 w-full max-w-2xl">
                                        <p className="text-neutral-800 text-center leading-relaxed whitespace-pre-wrap">{generatedDescription.description}</p>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Button 
                                            onClick={() => setShowShareOverlay(true)}
                                            className="px-8 py-3 min-w-[140px]"
                                        >
                                            Share
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                                                {/* My Images Gallery inside a white card */}
                                                <section className="mx-auto max-w-6xl px-6 pb-16">
                                                    <div className="w-full bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-2xl">
                                                        <h2 className="text-2xl font-bold text-[#0a174e] mb-4">My Images</h2>
                                                        {myImages.length === 0 ? (
                                                            <p className="text-neutral-700">No images yet. Generate Both to save and see them here.</p>
                                                        ) : (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                                                {myImages.map((img) => (
                                                                    <div key={img.id} className="bg-white rounded-xl border border-neutral-200 p-3 shadow">
                                                                        <a href={img.link} target="_blank" rel="noreferrer">
                                                                            <img src={img.link} alt={img.prompt} className="w-full rounded-lg object-contain" />
                                                                        </a>
                                                                        <div className="mt-2 text-sm text-neutral-700">{img.description || img.prompt}</div>
                                                                        <div className="text-xs text-neutral-500 mt-1">{img.created_at ? new Date(img.created_at).toLocaleString() : ''}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </section>

                {/* Share Overlay */}
                {showShareOverlay && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-[#1e40af]">Share Post</h3>
                                <button
                                    onClick={() => setShowShareOverlay(false)}
                                    className="text-neutral-500 hover:text-neutral-700 transition-colors p-1 hover:bg-neutral-100 rounded-full"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="border-t border-neutral-200 mb-4"></div>
                            <div className="space-y-2">
                                <button
                                    onClick={() => { shareToX(); setShowShareOverlay(false); }}
                                    className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform border border-neutral-200 focus:outline-none"
                                >
                                    <Image src="/icons/x.svg" alt="X" width={20} height={20} className="drop-shadow-md" />
                                    X / Twitter
                                </button>
                                <button
                                    onClick={() => { shareToLinkedIn(); setShowShareOverlay(false); }}
                                    className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform border border-neutral-200 focus:outline-none"
                                >
                                    <Image src="/icons/linkedin.svg" alt="LinkedIn" width={20} height={20} className="drop-shadow-md" />
                                    LinkedIn
                                </button>
                                <button
                                    onClick={() => { shareToFacebook(); setShowShareOverlay(false); }}
                                    className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform border border-neutral-200 focus:outline-none"
                                >
                                    <Image src="/icons/facebook.svg" alt="Facebook" width={20} height={20} className="drop-shadow-md" />
                                    Facebook
                                </button>
                                <button
                                    onClick={() => { shareToDiscord(); setShowShareOverlay(false); }}
                                    className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform border border-neutral-200 focus:outline-none"
                                >
                                    <Image src="/icons/discord.svg" alt="Discord" width={20} height={20} className="drop-shadow-md" />
                                    Discord
                                </button>
                                <button
                                    onClick={() => { shareToReddit(); setShowShareOverlay(false); }}
                                    className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform border border-neutral-200 focus:outline-none"
                                >
                                    <Image src="/icons/reddit.svg" alt="Reddit" width={20} height={20} className="drop-shadow-md" />
                                    Reddit
                                </button>
                                <button
                                    onClick={() => { shareToWhatsApp(); setShowShareOverlay(false); }}
                                    className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform border border-neutral-200 focus:outline-none"
                                >
                                    <Image src="/icons/whatsapp.svg" alt="WhatsApp" width={20} height={20} className="drop-shadow-md" />
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => { shareToTelegram(); setShowShareOverlay(false); }}
                                    className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform border border-neutral-200 focus:outline-none"
                                >
                                    <Image src="/icons/telegram.svg" alt="Telegram" width={20} height={20} className="drop-shadow-md" />
                                    Telegram
                                </button>
                                <div className="border-t border-neutral-200 my-3"></div>
                                <button
                                    onClick={() => { 
                                        if (generatedDescription) {
                                            navigator.clipboard.writeText(generatedDescription.description); 
                                        }
                                        setShowShareOverlay(false); 
                                    }}
                                    className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform border border-neutral-200 focus:outline-none"
                                >
                                    📋 Copy Description
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
}