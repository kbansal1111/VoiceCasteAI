'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import AuthModal from '@/components/common/AuthModal';
import Icon from '@/components/ui/AppIcon';
import api, { getStoredUser, isAuthenticated } from '@/lib/api';

interface Podcast {
    id: string;
    title: string;
    status: string;
    audio_url: string;
    video_url: string;
    session_video_url?: string;
    created_at: string;
    avatar_type: string;
}

const AccountPage = () => {
    const [podcasts, setPodcasts] = useState<Podcast[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const deleteSession = async (podcastId: string) => {
        if (!confirm('Are you sure you want to delete this recorded session?')) return;

        try {
            await api.delete(`/api/podcasts/${podcastId}/session`);
            setPodcasts(prev => prev.map(p =>
                p.id === podcastId ? { ...p, session_video_url: undefined } : p
            ));
        } catch (err) {
            console.error('Failed to delete session', err);
            alert('Failed to delete session recording.');
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            setError('Please log in to view your library.');
            setLoading(false);
            return;
        }

        setUser(getStoredUser());

        api.get('/api/podcasts')
            .then(({ data }) => setPodcasts(data))
            .catch((err) => {
                console.error('Failed to fetch podcasts', err);
                setError('Failed to load your library.');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleAuthClick = () => {
        setShowAuthModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header onAuthClick={handleAuthClick} />
                <div className="pt-24 px-6 max-w-7xl mx-auto">
                    <div className="h-8 w-64 bg-card animate-pulse rounded mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-video bg-card animate-pulse rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header onAuthClick={handleAuthClick} />

            <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-heading font-bold mb-2">My Library</h1>
                        <p className="text-muted-foreground italic">
                            {user ? `Welcome back, ${user.name}` : 'Your generated podcasts and recorded sessions.'}
                        </p>
                    </div>
                    <Link
                        href="/create-podcast"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-primary rounded-xl font-bold shadow-glow hover:scale-105 transition-transform"
                    >
                        <Icon name="PlusCircleIcon" size={24} />
                        <span>Create New</span>
                    </Link>
                </div>

                {error ? (
                    <div className="bg-destructive/10 border border-destructive/20 p-8 rounded-2xl text-center">
                        <p className="text-lg text-destructive mb-6">{error}</p>
                        <button
                            onClick={() => setShowAuthModal(true)}
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
                        >
                            Sign In / Register
                        </button>
                    </div>
                ) : podcasts.length === 0 ? (
                    <div className="bg-card border border-border p-12 rounded-2xl text-center space-y-6">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                            <Icon name="MusicalNoteIcon" size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">No podcasts found</h2>
                            <p className="text-muted-foreground">Start by generating your first AI podcast from any blog post!</p>
                        </div>
                        <Link
                            href="/landing-page"
                            className="inline-block px-8 py-3 border border-primary text-primary hover:bg-primary/10 rounded-xl font-bold transition-colors"
                        >
                            Learn More
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {podcasts.map((podcast) => (
                            <div
                                key={podcast.id}
                                className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-xl"
                            >
                                <div className="aspect-video relative overflow-hidden bg-black flex items-center justify-center">
                                    {/* Thumbnail / Preview Icon */}
                                    <Icon name="PlayCircleIcon" className="text-white/20 group-hover:text-primary/40 transition-colors" size={64} />

                                    {/* Badges */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                        <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                                            {podcast.avatar_type === 'avatar-1' ? 'Sitting Host' : 'Pro Host'}
                                        </div>
                                        {podcast.session_video_url && (
                                            <div className="px-3 py-1 bg-primary/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-glow">
                                                Recorded Session
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                        {podcast.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                                        <Icon name="CalendarIcon" size={14} />
                                        {new Date(podcast.created_at).toLocaleDateString()}
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/podcast-player?id=${podcast.id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted/80 rounded-xl font-bold transition-colors"
                                        >
                                            <Icon name="EyeIcon" size={18} />
                                            <span>Play Now</span>
                                        </Link>

                                        {(podcast.session_video_url || podcast.video_url) && (
                                            <div className="flex gap-2">
                                                <a
                                                    href={podcast.session_video_url ? `${podcast.session_video_url.replace('/upload/', '/upload/fl_attachment/')}` : podcast.video_url}
                                                    target="_blank"
                                                    download={`VoiceCast_${podcast.id}.mp4`}
                                                    className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                                                    title="Download Full Video"
                                                >
                                                    <Icon name="ArrowDownTrayIcon" size={20} />
                                                </a>

                                                {podcast.session_video_url && (
                                                    <button
                                                        onClick={() => deleteSession(podcast.id)}
                                                        className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive hover:text-white transition-all"
                                                        title="Delete Session Recording"
                                                    >
                                                        <Icon name="TrashIcon" size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => window.location.reload()}
            />
        </div>
    );
};

export default AccountPage;
