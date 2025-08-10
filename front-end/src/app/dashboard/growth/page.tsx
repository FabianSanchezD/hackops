'use client';

import { useMemo, useState } from 'react';
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

    const shareToSocialMedia = () => {
        if (generatedDescription) {
            // TODO: Change this to another social media
            const text = encodeURIComponent(generatedDescription.description);
            const url = `https://twitter.com/intent/tweet?text=${text}`;
            window.open(url, '_blank');
        }
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
                                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                                        <Button onClick={shareToSocialMedia}>Share on Social Media</Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => navigator.clipboard.writeText(generatedDescription.description)}
                                        >
                                            Copy Description
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        );
}