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

    // Session Recording State
    const [isRecordingSession, setIsRecordingSession] = useState(false);
    const [sessionChunks, setSessionChunks] = useState<Blob[]>([]);
    const sessionRecorderRef = useRef<MediaRecorder | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!podcastId) {
            setError('No podcast ID found in URL.');
            setLoading(false);
            return;
        }
        api.get(`/api/podcasts/${podcastId}`)
            .then(({ data }) => setPodcast(data))
            .catch((err) => {
                if (err.response?.status === 401) {
                    setError('Please log in to view this podcast.');
                } else {
                    setError('Podcast not found.');
                }
            })
            .finally(() => setLoading(false));
    }, [podcastId]);

    const startSessionRecording = () => {
        const canvas = document.querySelector('canvas');
        if (!canvas || !audioCtxRef.current) {
            console.error('Canvas or AudioContext not found');
            return;
        }

        try {
            // Master Audio Setup for Recording
            if (!masterDestRef.current) {
                masterDestRef.current = audioCtxRef.current.createMediaStreamDestination();
            }

            console.log('Starting session recording...');
            const canvasStream = (canvas as any).captureStream(30);

            const combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...masterDestRef.current.stream.getAudioTracks()
            ]);

            const recorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9',
                bitsPerSecond: 5000000
            });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                console.log('Recording stopped, preparing upload...');
                const blob = new Blob(chunks, { type: 'video/webm' });
                await uploadSessionVideo(blob);
            };

            recorder.start();
            sessionRecorderRef.current = recorder;
            setIsRecordingSession(true);
        } catch (err) {
            console.error('Failed to start session recording', err);
        }
    };

    const stopSessionRecording = () => {
        if (sessionRecorderRef.current?.state === 'recording') {
            sessionRecorderRef.current.stop();
            setIsRecordingSession(false);
        }
    };

    const uploadSessionVideo = async (blob: Blob) => {
        const formData = new FormData();
        formData.append('video', blob, `session_${podcastId}.webm`);
        formData.append('podcast_id', podcastId || '');

        try {
            const { data } = await api.post('/api/podcasts/upload-session', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Session video uploaded successfully:', data.url);
        } catch (err) {
            console.error('Failed to upload session video', err);
        }
    };

    const handleAuthClick = (type: 'login' | 'register') => {
        setAuthType(type);
        setShowAuthModal(true);
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
    };

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
            // Stop recording
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
                setIsInterrupting(false);
            }
            return;
        }

        // Start recording
        setIsPlaying(false); // Pause main playback
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
                    const { data } = await api.post('/api/voice-interrupt', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    if (data.audio_url) {
                        playInterruptionResponse(data.audio_url);
                    } else {
                        setIsPlaying(true); // resume if failed
                    }
                } catch (err) {
                    console.error('Failed to process voice interruption', err);
                    setIsPlaying(true);
                } finally {
                    setIsProcessingInterruption(false);
                }
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsInterrupting(true);

            // Auto stop after 15 seconds max
            setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                    setIsInterrupting(false);
                }
            }, 15000);

        } catch (err) {
            console.error('Failed to access microphone', err);
        }
    };

    const playInterruptionResponse = (url: string) => {
        const audio = new Audio(url);
        audio.crossOrigin = "anonymous";

        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        const source = audioCtxRef.current.createMediaElementSource(audio);
        analyzerRef.current = audioCtxRef.current.createAnalyser();
        analyzerRef.current.fftSize = 64;

        source.connect(analyzerRef.current);
        analyzerRef.current.connect(audioCtxRef.current.destination);

        // ALSO connect to master recording destination if it exists
        if (masterDestRef.current) {
            source.connect(masterDestRef.current);
        }

        audio.onplay = () => {
            setIsAnswering(true);
            const bufferLength = analyzerRef.current!.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateAudioData = () => {
                if (!analyzerRef.current) return;
                analyzerRef.current.getByteFrequencyData(dataArray);
                const normalizedData = Array.from(dataArray).map(v => v / 255);
                setInterruptionAudioData(normalizedData);
                animationFrameRef.current = requestAnimationFrame(updateAudioData);
            };
            updateAudioData();
        };

        audio.onended = () => {
            setIsAnswering(false);
            setInterruptionAudioData([]);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            setIsPlaying(true); // Automatically resume main podcast
        };

        audio.play()
            .then(() => {
                audio.playbackRate = 1.25;
            })
            .catch(e => {
                console.error("Audio play failed", e);
                setIsPlaying(true);
            });
    };

    if (!isHydrated || loading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="h-16 bg-card animate-pulse" />
                <div className="max-w-[1920px] mx-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
                        <div className="lg:col-span-8 bg-card rounded-xl animate-pulse" />
                        <div className="lg:col-span-4 bg-card rounded-xl animate-pulse" />
                    </div>
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

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden text-sm md:text-base">
            <Header onAuthClick={handleAuthClick} />

            <main className="flex-1 flex flex-col px-4 md:px-6 pt-16 pb-4 overflow-hidden">
                <div className="flex items-center justify-between mb-2 shrink-0 gap-4 min-h-[64px]">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl md:text-2xl font-heading font-bold truncate leading-tight text-white" title={podcast.title}>
                            Podcast: {podcast.title}
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Interactive AI Podcast
                        </p>
                    </div>
                    <div className="shrink-0 flex items-center space-x-3">
                        <ExportControls
                            podcastId={podcast.id}
                            podcastTitle={podcast.title}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
                    {/* Main AV Area (Left 8 columns) */}
                    <div className="lg:col-span-8 flex flex-col h-full relative min-h-0">
                        {/* Massive 3D Avatar space with absolute controls overlay */}
                        <div className="flex-1 relative rounded-xl overflow-hidden shadow-xl border border-border bg-black group">
                            {/* Session Recording Button */}
                            <div className="absolute top-6 left-6 z-20">
                                <button
                                    onClick={isRecordingSession ? stopSessionRecording : startSessionRecording}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md border ${isRecordingSession
                                        ? 'bg-destructive/80 border-destructive text-white animate-pulse'
                                        : 'bg-black/40 border-white/20 text-white hover:bg-black/60'
                                        }`}
                                >
                                    <div className={`w-3 h-3 rounded-full ${isRecordingSession ? 'bg-white' : 'bg-destructive'}`} />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {isRecordingSession ? 'Recording Live' : 'Record Session'}
                                    </span>
                                </button>
                            </div>

                            <Avatar3D
                                isPlaying={isPlaying || isAnswering}
                                currentTime={currentTime}
                                audioData={isAnswering ? interruptionAudioData : audioData}
                                avatarType={podcast.avatar_type}
                            />

                            {/* Absolute Voice Interruption Overlay */}
                            <div className="absolute top-6 right-6 z-20">
                                <button
                                    onClick={toggleInterruption}
                                    className={`flex items-center gap-3 px-8 py-4 rounded-full shadow-2xl transition-all duration-300 backdrop-blur-xl border-2 ${isInterrupting
                                        ? 'bg-destructive/90 border-destructive animate-pulse text-white'
                                        : isProcessingInterruption
                                            ? 'bg-amber-500/90 border-amber-400 text-white cursor-wait'
                                            : isAnswering
                                                ? 'bg-success/90 border-success text-white'
                                                : 'bg-card/60 border-white/20 hover:bg-card/80 text-foreground scale-110'
                                        }`}
                                    disabled={isProcessingInterruption || isAnswering}
                                >
                                    {isInterrupting ? (
                                        <>
                                            <div className="w-4 h-4 rounded-full bg-white animate-ping" />
                                            <span className="font-bold text-lg">Stop & Send</span>
                                        </>
                                    ) : isProcessingInterruption ? (
                                        <>
                                            <Icon name="ArrowPathIcon" className="animate-spin" size={24} />
                                            <span className="font-bold text-lg">Thinking...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="MicrophoneIcon" size={24} />
                                            <span className="font-bold text-lg">Interrupt & Speak</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* BOTTOM OVERLAY: Audio Player Controls */}
                            <div className="absolute bottom-4 left-4 right-4 z-30 opacity-95 hover:opacity-100 transition-opacity duration-300">
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
                    </div>

                    {/* Interactive Chat (Right 4 columns) */}
                    <div className="lg:col-span-4 h-full min-h-0">
                        <ChatPanel
                            podcastId={podcast.id}
                            podcastContext={podcast.blog_text || podcast.script || ''}
                            currentTime={currentTime}
                            onAction={handleVoiceAction}
                        />
                    </div>
                </div>
            </main>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialType={authType}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
};

export default PodcastPlayerInteractive;