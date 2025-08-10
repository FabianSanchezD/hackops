'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Navbar from '../../../components/dashboard/Navbar';
import Button from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';

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

export default function GrowthPage() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPost, setGeneratedPost] = useState<PostResponse | null>(null);
    const [generatedDescription, setGeneratedDescription] = useState<DescriptionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showShareOverlay, setShowShareOverlay] = useState(false);

    const API_URL = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

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
        setIsGenerating(true);
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
            setIsGenerating(false);
        }
    };

    const generateDescription = async () => {
        if (!prompt.trim() || !ensureApi()) return;
        setIsGenerating(true);
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
            setIsGenerating(false);
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
            <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
                <Navbar />
                <main className="mx-auto max-w-5xl px-4 py-6 md:py-10 flex flex-col items-center">
                    {/* Centered hero card */}
                    <Card className="w-full max-w-3xl border-neutral-200 shadow-sm">
                        <CardContent className="p-5 md:p-7">
                            <div className="text-center mb-4 md:mb-6">
                                <h1 className="text-2xl md:text-3xl font-bold text-[#1e40af]">Growth Assistant</h1>
                                <p className="text-neutral-600 mt-2">Generate a post image and description from one prompt.</p>
                            </div>

                            <label htmlFor="prompt" className="block text-sm font-medium text-neutral-700 mb-2">
                                Your prompt
                            </label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Announce our global AI hackathon with prizes and mentorship"
                                className="w-full p-3 md:p-4 border border-neutral-300 rounded-md focus:ring-2 focus:ring-[#1e40af]/70 focus:border-transparent min-h-[120px]"
                                rows={4}
                            />

                            {error && (
                                <div className="mt-3 text-sm text-red-600">{error}</div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 justify-center">
                                <Button onClick={generateBoth} disabled={isGenerating || !prompt.trim()}>
                                    {isGenerating ? 'Generating…' : 'Generate Both'}
                                </Button>
                                <Button onClick={generatePost} disabled={isGenerating || !prompt.trim()} variant="secondary">
                                    Image Only
                                </Button>
                                <Button onClick={generateDescription} disabled={isGenerating || !prompt.trim()} variant="secondary">
                                    Description Only
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Combined preview centered */}
                    {generatedPost && generatedDescription && (
                        <Card className="w-full max-w-3xl border-neutral-200 mt-6 shadow">
                            <CardContent className="p-5 md:p-7">
                                <div className="flex flex-col items-center">
                                    <a href={generatedPost.image} target="_blank" rel="noreferrer">
                                        <img src={generatedPost.image} alt="Generated post" className="w-full max-w-md rounded-lg shadow mb-4" />
                                    </a>
                                    <p className="text-neutral-800 text-center leading-relaxed whitespace-pre-wrap">{generatedDescription.description}</p>
                                    <div className="flex items-center justify-center mt-5">
                                        <Button 
                                            onClick={() => setShowShareOverlay(true)}
                                            className="px-8 py-2 min-w-[140px]"
                                        >
                                            Share
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Share Overlay */}
                    {showShareOverlay && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <Card className="w-full max-w-md border-neutral-200 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-[#1e40af]">Share Post</h3>
                                        <button
                                            onClick={() => setShowShareOverlay(false)}
                                            className="text-neutral-500 hover:text-neutral-700 transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="border-t border-neutral-200 mb-4"></div>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => { shareToX(); setShowShareOverlay(false); }}
                                            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-md hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform"
                                        >
                                            <Image src="/icons/x.svg" alt="X" width={20} height={20} className="drop-shadow-md" />
                                            X / Twitter
                                        </button>
                                        <button
                                            onClick={() => { shareToLinkedIn(); setShowShareOverlay(false); }}
                                            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-md hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform"
                                        >
                                            <Image src="/icons/linkedin.svg" alt="LinkedIn" width={20} height={20} className="drop-shadow-md" />
                                            LinkedIn
                                        </button>
                                        <button
                                            onClick={() => { shareToFacebook(); setShowShareOverlay(false); }}
                                            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-md hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform"
                                        >
                                            <Image src="/icons/facebook.svg" alt="Facebook" width={20} height={20} className="drop-shadow-md" />
                                            Facebook
                                        </button>
                                        <button
                                            onClick={() => { shareToDiscord(); setShowShareOverlay(false); }}
                                            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-md hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform"
                                        >
                                            <Image src="/icons/discord.svg" alt="Discord" width={20} height={20} className="drop-shadow-md" />
                                            Discord
                                        </button>
                                        <button
                                            onClick={() => { shareToReddit(); setShowShareOverlay(false); }}
                                            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-md hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform"
                                        >
                                            <Image src="/icons/reddit.svg" alt="Reddit" width={20} height={20} className="drop-shadow-md" />
                                            Reddit
                                        </button>
                                        <button
                                            onClick={() => { shareToWhatsApp(); setShowShareOverlay(false); }}
                                            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-md hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform"
                                        >
                                            <Image src="/icons/whatsapp.svg" alt="WhatsApp" width={20} height={20} className="drop-shadow-md" />
                                            WhatsApp
                                        </button>
                                        <button
                                            onClick={() => { shareToTelegram(); setShowShareOverlay(false); }}
                                            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-md hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform"
                                        >
                                            <Image src="/icons/telegram.svg" alt="Telegram" width={20} height={20} className="drop-shadow-md" />
                                            Telegram
                                        </button>
                                        <div className="border-t border-neutral-200 my-2"></div>
                                        <button
                                            onClick={() => { 
                                                if (generatedDescription) {
                                                    navigator.clipboard.writeText(generatedDescription.description); 
                                                }
                                                setShowShareOverlay(false); 
                                            }}
                                            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-md hover:bg-neutral-50 transition-all duration-200 hover:scale-[1.02] hover:shadow-md transform"
                                        >
                                            📋 Copy Description
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        );
}