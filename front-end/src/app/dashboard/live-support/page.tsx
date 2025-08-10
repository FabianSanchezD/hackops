"use client";

import { useMemo, useState, useEffect } from "react";
import GrowthNavbar from "../../../components/dashboard/GrowthNavbar";
import Button from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

// Three dots loading animation component
const ThreeDotsLoader = ({ text = "Creating" }: { text?: string }) => {
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

interface Meeting {
    id: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    meetLink?: string;
    htmlLink?: string;
    attendees: string[];
}

export default function LiveSupportPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [attendees, setAttendees] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [authUrl, setAuthUrl] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const API_URL = useMemo(() => process.env.NEXT_PUBLIC_API_URL, []);

    const ensureApi = () => {
        if (!API_URL) {
            console.error('NEXT_PUBLIC_API_URL is not set');
            alert('API base URL is not configured. Please set NEXT_PUBLIC_API_URL in .env');
            return false;
        }
        return true;
    };

    const fetchMeetings = async () => {
        if (!ensureApi()) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/live-support/meetings?includePastHours=24&maxResults=50&hackopsOnly=true`, {
                credentials: 'include'
            });
            const data = await response.json();
            // If Google isn't connected yet, show connect prompt
            if (response.status === 401 && data?.authUrl) {
                setAuthUrl(data.authUrl);
                setError('Google Calendar not connected. Please connect to continue.');
                setMeetings([]);
                setIsConnected(false);
                return;
            }

            if (!response.ok) throw new Error(data.error || data.details || 'Failed to fetch meetings');
            setMeetings(data.meetings || []);
            setError(null);
            setAuthUrl(null);
            setIsConnected(true);
        } catch (error: any) {
            console.error('Error fetching meetings:', error);
            setError(error.message || 'Failed to fetch meetings');
            // Leave isConnected as-is on generic errors
        } finally {
            setIsLoading(false);
        }
    };

    const createMeeting = async () => {
        if (!ensureApi() || !title.trim() || !startTime || !endTime) {
            setError('Please fill in all required fields');
            return;
        }

        setIsCreating(true);
        setError(null);
        setSuccess(null);

        try {
            const attendeeEmails = attendees.split(',').map(email => email.trim()).filter(email => email);
            
            const response = await fetch(`${API_URL}/live-support/create-meeting`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    startTime,
                    endTime,
                    attendees: attendeeEmails
                })
            });

            const data = await response.json();
            // Handle not connected case
            if (response.status === 401 && data?.authUrl) {
                setAuthUrl(data.authUrl);
                setIsConnected(false);
                throw new Error('Google Calendar not connected. Please connect to continue.');
            }

            if (!response.ok) throw new Error(data.error || data.details || 'Failed to create meeting');

            setSuccess(`Meeting created successfully! Meet link: ${data.meetLink}`);
            
            // Clear form
            setTitle('');
            setDescription('');
            setStartTime('');
            setEndTime('');
            setAttendees('');

            // Refresh meetings list
            fetchMeetings();

        } catch (error: any) {
            console.error('Error creating meeting:', error);
            setError(error.message || 'Failed to create meeting');
        } finally {
            setIsCreating(false);
        }
    };

    const deleteMeeting = async (eventId: string) => {
        if (!ensureApi()) return;
        
        try {
            const response = await fetch(`${API_URL}/live-support/meetings/${eventId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                if (response.status === 401 && data?.authUrl) {
                    setAuthUrl(data.authUrl);
                    setIsConnected(false);
                    throw new Error('Google Calendar not connected. Please connect to continue.');
                }
                throw new Error(data.error || data.details || 'Failed to delete meeting');
            }

            setSuccess('Meeting deleted successfully');
            fetchMeetings();
        } catch (error: any) {
            console.error('Error deleting meeting:', error);
            setError(error.message || 'Failed to delete meeting');
        }
    };

    const formatDateTime = (dateTimeString: string) => {
        return new Date(dateTimeString).toLocaleString();
    };

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setSuccess(`${type} copied to clipboard!`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError('Failed to copy to clipboard');
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const launchAuth = () => {
        if (authUrl) window.open(authUrl, '_blank', 'noopener,noreferrer');
    };

    const disconnectGoogle = async () => {
        if (!ensureApi()) return;
        setIsDisconnecting(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch(`${API_URL}/live-support/disconnect`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || data.details || 'Failed to disconnect');
            // Reset local state and expose fresh authUrl
            setMeetings([]);
            setAuthUrl(data.authUrl || null);
            setIsConnected(false);
            setSuccess('Disconnected from Google Calendar');
        } catch (error: any) {
            console.error('Error disconnecting:', error);
            setError(error.message || 'Failed to disconnect');
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a174e] via-[#1e40af] to-[#3b82f6]">
            <GrowthNavbar />
            <main className="flex items-center justify-center p-6 pt-20">
                <div className="w-full max-w-6xl bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#0a174e] mb-4">Live Event Support</h1>
                        <p className="text-neutral-600">Create and manage Google Meet sessions for hackathon support</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Create Meeting Form */}
                        <div className="bg-white/50 border border-neutral-200 rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-semibold text-[#0a174e] mb-6">Create New Meeting</h2>
                            {authUrl && (
                                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-amber-800 text-sm mb-3">Google Calendar connection required to create meetings.</p>
                                    <div className="flex gap-3">
                                        <Button onClick={launchAuth} className="px-4 py-2">Connect Google Calendar</Button>
                                        <Button onClick={fetchMeetings} variant="secondary" className="px-4 py-2">I connected it — Retry</Button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Meeting Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-colors"
                                        placeholder="Hackathon Support Session"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-colors h-24 resize-none"
                                        placeholder="Brief description of the support session"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Start Time *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            End Time *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Attendee Emails (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={attendees}
                                        onChange={(e) => setAttendees(e.target.value)}
                                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#1e40af] focus:border-[#1e40af] transition-colors"
                                        placeholder="email1@example.com, email2@example.com"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-green-700 text-sm">{success}</p>
                                </div>
                            )}

                            <Button
                                onClick={createMeeting}
                                disabled={isCreating || !title.trim() || !startTime || !endTime}
                                className="w-full mt-6 px-8 py-3"
                            >
                                {isCreating ? (
                                    <ThreeDotsLoader key="creating" />
                                ) : (
                                    'Create Meeting'
                                )}
                            </Button>
                        </div>

                        {/* Meetings List */}
                        <div className="bg-white/50 border border-neutral-200 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-[#0a174e]">Upcoming Meetings</h2>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={fetchMeetings}
                                        disabled={isLoading}
                                        variant="secondary"
                                        className="px-4 py-2"
                                    >
                                        {isLoading ? (
                                            <ThreeDotsLoader text="Loading" key="loading" />
                                        ) : (
                                            'Refresh'
                                        )}
                                    </Button>
                                    {isConnected === true && (
                                        <Button
                                            onClick={disconnectGoogle}
                                            disabled={isDisconnecting}
                                            variant="secondary"
                                            className="px-4 py-2 text-red-600 hover:bg-red-50"
                                        >
                                            {isDisconnecting ? (
                                                <ThreeDotsLoader text="Signing out" key="disconnecting" />
                                            ) : (
                                                'Sign out of Google'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {meetings.length === 0 ? (
                                    <div className="text-center py-8 text-neutral-500">
                                        {authUrl ? (
                                            <div>
                                                <p className="mb-3">Google Calendar not connected.</p>
                                                <Button onClick={launchAuth}>Connect Google Calendar</Button>
                                            </div>
                                        ) : isConnected === true ? (
                                            <p>No upcoming meetings.</p>
                                        ) : (
                                            'No upcoming meetings found'
                                        )}
                                    </div>
                                ) : (
                                    meetings.map((meeting) => (
                                        <div key={meeting.id} className="bg-white rounded-lg border border-neutral-200 p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-[#0a174e]">{meeting.title}</h3>
                                                <Button
                                                    onClick={() => deleteMeeting(meeting.id)}
                                                    variant="secondary"
                                                    className="px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                            
                                            {meeting.description && (
                                                <p className="text-sm text-neutral-600 mb-2">{meeting.description}</p>
                                            )}
                                            
                                            <div className="text-sm text-neutral-700 mb-3">
                                                <p><strong>Start:</strong> {formatDateTime(meeting.start)}</p>
                                                <p><strong>End:</strong> {formatDateTime(meeting.end)}</p>
                                                {meeting.attendees.length > 0 && (
                                                    <p><strong>Attendees:</strong> {meeting.attendees.join(', ')}</p>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2 flex-wrap">
                                                {meeting.meetLink && (
                                                    <a
                                                        href={meeting.meetLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1 bg-[#1e40af] text-white text-sm rounded-md hover:bg-[#0a174e] transition-colors"
                                                    >
                                                        Join Meet
                                                    </a>
                                                )}
                                                {meeting.htmlLink && (
                                                    <a
                                                        href={meeting.htmlLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-md hover:bg-neutral-200 transition-colors"
                                                    >
                                                        Calendar
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}