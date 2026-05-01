'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/common/Header';
import AuthModal from '@/components/common/AuthModal';
import Avatar3D from './Avatar3D';
import AudioPlayer from './AudioPlayer';
import ChatPanel from './ChatPanel';
import ExportControls from './ExportControls';
import Icon from '@/components/ui/AppIcon';
import api from '@/lib/api';

interface PodcastData {
    id: string;
    title: string;
    audio_url: string;
    transcript_json?: { word: string; start: number; end: number }[];
    script?: string;
    blog_text?: string;
    duration_seconds?: number;
    avatar_type?: string;
    video_url?: string;
}

const PodcastPlayerInteractive = () => {
    const searchParams = useSearchParams();
    const podcastId = searchParams.get('id');
    const [isHydrated, setIsHydrated] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authType, setAuthType] = useState<'login' | 'register'>('login');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioData, setAudioData] = useState<number[]>([]);
    const [podcast, setPodcast] = useState<PodcastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Voice Interruption State
    const [isInterrupting, setIsInterrupting] = useState(false);
    const [isProcessingInterruption, setIsProcessingInterruption] = useState(false);
    const [isAnswering, setIsAnswering] = useState(false);
    const [interruptionAudioData, setInterruptionAudioData] = useState<number[]>([]);

    // Chat sidebar toggle — closed by default
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Session Recording State
    const [isRecordingSession, setIsRecordingSession] = useState(false);
    const sessionRecorderRef = useRef<MediaRecorder | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    useEffect(() => { setIsHydrated(true); }, []);

    useEffect(() => {
        if (!podcastId) { setError('No podcast ID found in URL.'); setLoading(false); return; }
        api.get(`/api/podcasts/${podcastId}`)
            .then(({ data }) => setPodcast(data))
            .catch((err) => {
                setError(err.response?.status === 401 ? 'Please log in to view this podcast.' : 'Podcast not found.');
            })
            .finally(() => setLoading(false));
    }, [podcastId]);

    /* ─── Session Recording ─────────────────────────────────────────── */
    const startSessionRecording = () => {
        const canvas = document.querySelector('canvas');
        if (!canvas || !audioCtxRef.current) { console.error('Canvas or AudioContext not found'); return; }
        try {
            if (!masterDestRef.current) {
                masterDestRef.current = audioCtxRef.current.createMediaStreamDestination();
            }
            const canvasStream = (canvas as any).captureStream(30);
            const combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...masterDestRef.current.stream.getAudioTracks()
            ]);
            const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9', bitsPerSecond: 5000000 });
            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const formData = new FormData();
                formData.append('video', blob, `session_${podcastId}.webm`);
                formData.append('podcast_id', podcastId || '');
                try {
                    await api.post('/api/podcasts/upload-session', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                } catch (err) { console.error('Failed to upload session video', err); }
            };
            recorder.start();
            sessionRecorderRef.current = recorder;
            setIsRecordingSession(true);
        } catch (err) { console.error('Failed to start session recording', err); }
    };

    const stopSessionRecording = () => {
        if (sessionRecorderRef.current?.state === 'recording') {
            sessionRecorderRef.current.stop();
            setIsRecordingSession(false);
        }
    };

    /* ─── Voice Interruption ────────────────────────────────────────── */
    const handleVoiceAction = (action: string) => {
        switch (action) {
            case 'play': setIsPlaying(true); break;
            case 'pause': setIsPlaying(false); break;
            case 'forward': setCurrentTime(prev => prev + 15); break;
            case 'rewind': setCurrentTime(prev => Math.max(0, prev - 15)); break;
        }
    };

    const toggleInterruption = async () => {
        if (isInterrupting) {
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
                setIsInterrupting(false);
            }
            return;
        }
        setIsPlaying(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                setIsProcessingInterruption(true);
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', blob, 'voice.webm');
                formData.append('podcast_id', podcastId || '');
                formData.append('context_timestamp', currentTime.toString());
                try {
                    const { data } = await api.post('/api/voice-interrupt', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                    if (data.audio_url) playInterruptionResponse(data.audio_url);
                    else setIsPlaying(true);
                } catch (err) {
                    console.error('Failed to process voice interruption', err);
                    setIsPlaying(true);
                } finally { setIsProcessingInterruption(false); }
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsInterrupting(true);
            setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                    setIsInterrupting(false);
                }
            }, 15000);
        } catch (err) { console.error('Failed to access microphone', err); }
    };

    const playInterruptionResponse = (url: string) => {
        const audio = new Audio(url);
        audio.crossOrigin = 'anonymous';
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        const source = audioCtxRef.current.createMediaElementSource(audio);
        analyzerRef.current = audioCtxRef.current.createAnalyser();
        analyzerRef.current.fftSize = 64;
        source.connect(analyzerRef.current);
        analyzerRef.current.connect(audioCtxRef.current.destination);
        if (masterDestRef.current) source.connect(masterDestRef.current);
        audio.onplay = () => {
            setIsAnswering(true);
            const bufferLength = analyzerRef.current!.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            const update = () => {
                if (!analyzerRef.current) return;
                analyzerRef.current.getByteFrequencyData(dataArray);
                setInterruptionAudioData(Array.from(dataArray).map(v => v / 255));
                animationFrameRef.current = requestAnimationFrame(update);
            };
            update();
        };
        audio.onended = () => {
            setIsAnswering(false);
            setInterruptionAudioData([]);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            setIsPlaying(true);
        };
        audio.play().then(() => { audio.playbackRate = 1.25; }).catch(e => { console.error('Audio play failed', e); setIsPlaying(true); });
    };

    /* ─── Loading / Error States ────────────────────────────────────── */
    if (!isHydrated || loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <div className="h-16 bg-card animate-pulse" />
                <div className="flex-1 p-6 flex gap-4">
                    <div className="flex-1 bg-card rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (error || !podcast) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-xl text-muted-foreground">{error || 'Podcast not found'}</p>
                    <div className="flex flex-col gap-2">
                        <a href="/account" className="text-primary font-bold hover:underline">Go to My Library</a>
                        <a href="/create-podcast" className="text-muted-foreground text-sm hover:underline">Create a New Podcast</a>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── Main Render ───────────────────────────────────────────────── */
    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* ── Top Navigation Bar ── */}
            <Header onAuthClick={(type) => { setAuthType(type); setShowAuthModal(true); }} />

            {/* ── Sub-Header Row (title + actions) ── */}
            <div className="flex items-center justify-between px-4 md:px-6 py-2 pt-[68px] shrink-0 gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-base md:text-xl font-heading font-bold truncate text-white" title={podcast.title}>
                        {podcast.title}
                    </h1>
                    <p className="text-xs text-muted-foreground">Interactive AI Podcast</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle Chat Button */}
                    <button
                        onClick={() => setIsChatOpen(prev => !prev)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                            isChatOpen
                                ? 'bg-primary border-primary text-white shadow-glow'
                                : 'bg-card border-border hover:bg-muted text-foreground'
                        }`}
                    >
                        <Icon name="ChatBubbleLeftRightIcon" size={18} />
                        <span className="hidden sm:inline">{isChatOpen ? 'Close Chat' : 'Interactive Chat'}</span>
                    </button>

                    <ExportControls
                        podcastId={podcast.id}
                        podcastTitle={podcast.title}
                        audioUrl={podcast.audio_url}
                        videoUrl={podcast.video_url}
                    />
                </div>
            </div>

            {/* ── Main Content Area (fills remaining height) ── */}
            <div className="relative flex-1 min-h-0 overflow-hidden px-4 md:px-6 pb-4">

                {/* ══ Full-Screen Podcast 3D Window ══ */}
                <div className="w-full h-full relative rounded-xl overflow-hidden border border-border/50 bg-black shadow-2xl">

                    {/* 3D Avatar Scene */}
                    <Avatar3D
                        isPlaying={isPlaying || isAnswering}
                        currentTime={currentTime}
                        audioData={isAnswering ? interruptionAudioData : audioData}
                        avatarType={podcast.avatar_type}
                    />

                    {/* ── Record Session Button (top-left overlay) ── */}
                    <div className="absolute top-6 left-6 z-20">
                        <button
                            onClick={isRecordingSession ? stopSessionRecording : startSessionRecording}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-bold uppercase tracking-wider transition-all ${
                                isRecordingSession
                                    ? 'bg-red-600/80 border-red-500 text-white animate-pulse'
                                    : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                            }`}
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${isRecordingSession ? 'bg-white animate-ping' : 'bg-red-500'}`} />
                            {isRecordingSession ? 'Recording...' : 'Record Session'}
                        </button>
                    </div>

                    {/* ── Interrupt & Speak Button (top-right overlay) ── */}
                    <div className="absolute top-6 right-6 z-20">
                        <button
                            onClick={toggleInterruption}
                            disabled={isProcessingInterruption || isAnswering}
                            className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl transition-all duration-300 backdrop-blur-xl border-2 font-bold text-sm ${
                                isInterrupting
                                    ? 'bg-red-600/90 border-red-500 animate-pulse text-white'
                                    : isProcessingInterruption
                                        ? 'bg-amber-500/90 border-amber-400 text-white cursor-wait'
                                        : isAnswering
                                            ? 'bg-green-600/90 border-green-500 text-white'
                                            : 'bg-white/10 border-white/30 hover:bg-white/20 text-white'
                            }`}
                        >
                            {isInterrupting ? (
                                <><div className="w-3 h-3 rounded-full bg-white animate-ping" /><span>Stop & Send</span></>
                            ) : isProcessingInterruption ? (
                                <><Icon name="ArrowPathIcon" className="animate-spin" size={18} /><span>Thinking...</span></>
                            ) : (
                                <><Icon name="MicrophoneIcon" size={18} /><span>Interrupt & Speak</span></>
                            )}
                        </button>
                    </div>

                    {/* ── Audio Player (bottom overlay) ── */}
                    <div className="absolute bottom-6 left-6 right-6 z-30">
                        <AudioPlayer
                            audioUrl={podcast.audio_url}
                            transcript={podcast.script || ''}
                            chapters={[]}
                            onTimeUpdate={setCurrentTime}
                            onPlayStateChange={setIsPlaying}
                            onAudioData={setAudioData}
                            externalPause={isInterrupting || isAnswering || isProcessingInterruption}
                            isOverlay={true}
                            recordingDestination={masterDestRef.current}
                        />
                    </div>
                </div>

                {/* ══ Collapsible Chat Sidebar (overlay over 3D) ══
                    When isChatOpen=false → translate fully off screen to the right
                    When isChatOpen=true  → slide into view                        */}
                <div
                    className={`absolute top-0 right-4 h-full w-[380px] max-w-full z-40 transition-transform duration-300 ease-in-out ${
                        isChatOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'
                    }`}
                >
                    <div className="h-full rounded-xl bg-card/95 backdrop-blur-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
                        {/* Chat Header with close button */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                            <div>
                                <h2 className="font-bold text-sm">Interactive Chat</h2>
                                <p className="text-xs text-muted-foreground">Ask questions about the podcast content</p>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <Icon name="XMarkIcon" size={18} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-hidden">
                            <ChatPanel
                                podcastId={podcast.id}
                                podcastContext={podcast.blog_text || podcast.script || ''}
                                currentTime={currentTime}
                                onAction={handleVoiceAction}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialType={authType}
                onSuccess={() => setShowAuthModal(false)}
            />
        </div>
    );
};

export default PodcastPlayerInteractive;