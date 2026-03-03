'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Chapter {
    id: string;
    title: string;
    timestamp: number;
}

interface AudioPlayerProps {
    audioUrl: string;
    transcript: string;
    chapters: Chapter[];
    onTimeUpdate: (time: number) => void;
    onPlayStateChange: (isPlaying: boolean) => void;
    onAudioData?: (data: number[]) => void;
    externalPause?: boolean;
    isOverlay?: boolean;
    recordingDestination?: MediaStreamAudioDestinationNode | null;
}

const AudioPlayer = ({
    audioUrl,
    transcript,
    chapters,
    onTimeUpdate,
    onPlayStateChange,
    onAudioData,
    externalPause,
    isOverlay = false,
    recordingDestination,
}: AudioPlayerProps) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showChapters, setShowChapters] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);
    const [showPlaybackSpeed, setShowPlaybackSpeed] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (externalPause && isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            onPlayStateChange(false);
        }
    }, [externalPause, isPlaying, onPlayStateChange]);

    useEffect(() => {
        if (!isHydrated || !audioRef.current) return;

        const audio = audioRef.current;

        const setupAnalyzer = () => {
            if (!audioCtxRef.current) {
                try {
                    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                    analyzerRef.current = audioCtxRef.current.createAnalyser();
                    analyzerRef.current.fftSize = 64;
                    sourceRef.current = audioCtxRef.current.createMediaElementSource(audio);
                    sourceRef.current.connect(analyzerRef.current);
                    analyzerRef.current.connect(audioCtxRef.current.destination);

                    // Connect to recording destination if provided
                    if (recordingDestination) {
                        sourceRef.current.connect(recordingDestination);
                    }
                } catch (e) {
                    console.error("Failed to setup audio analyzer:", e);
                }
            }
        };

        const handlePlay = () => {
            setupAnalyzer();
            if (audioCtxRef.current?.state === 'suspended') {
                audioCtxRef.current.resume();
            }

            if (!analyzerRef.current) return;
            const bufferLength = analyzerRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateAudioData = () => {
                if (audio.paused) return; // Stop loop if paused
                analyzerRef.current!.getByteFrequencyData(dataArray);
                const normalizedData = Array.from(dataArray).map(v => v / 255);
                if (onAudioData) onAudioData(normalizedData);
                animationFrameRef.current = requestAnimationFrame(updateAudioData);
            };

            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = requestAnimationFrame(updateAudioData);
        };

        const handlePause = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            onTimeUpdate(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            onPlayStateChange(false);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
        // We INTENTIONALLY omit simple state from the dependency array so it doesn't re-mount and crash the source mode
    }, [isHydrated, onTimeUpdate, onPlayStateChange, onAudioData]);

    // Handle dynamic connection to master recording destination
    useEffect(() => {
        if (recordingDestination && sourceRef.current && analyzerRef.current) {
            console.log("Connecting audio to master recording destination...");
            sourceRef.current.connect(recordingDestination);
        }
    }, [recordingDestination]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            onPlayStateChange(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        onPlayStateChange(true);
                    })
                    .catch((err) => {
                        console.error("Audio playback prevented:", err);
                        // Make sure state reflects reality
                        setIsPlaying(false);
                        onPlayStateChange(false);
                    });
            } else {
                setIsPlaying(true);
                onPlayStateChange(true);
            }
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !progressRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const skipTime = (seconds: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const handlePlaybackRateChange = (rate: number) => {
        setPlaybackRate(rate);
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
        }
    };

    const jumpToChapter = (timestamp: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = timestamp;
        setCurrentTime(timestamp);
        setShowChapters(false);
    };

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!isHydrated) {
        return (
            <div className={`w-full bg-card rounded-xl animate-pulse ${isOverlay ? 'h-16' : 'h-full p-6'}`}>
                <div className="flex items-center space-x-4 h-full px-4">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 h-2 bg-muted rounded-full" />
                    <div className="w-20 h-4 bg-muted rounded" />
                </div>
            </div>
        );
    }

    if (isOverlay) {
        return (
            <div className="w-full flex flex-col space-y-2">
                <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" />

                {/* Popover Menus */}
                <div className="relative">
                    {showChapters && (
                        <div className="absolute bottom-full mb-4 left-0 w-80 max-h-60 overflow-y-auto bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="p-2 border-b border-white/5 mb-2">
                                <h3 className="text-sm font-semibold">Chapters</h3>
                            </div>
                            {chapters.length > 0 ? chapters.map((chapter) => (
                                <button
                                    key={chapter.id}
                                    onClick={() => jumpToChapter(chapter.timestamp)}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-xs flex justify-between items-center"
                                >
                                    <span>{chapter.title}</span>
                                    <span className="opacity-60">{formatTime(chapter.timestamp)}</span>
                                </button>
                            )) : <p className="text-xs text-muted-foreground p-4 text-center">No chapters available</p>}
                        </div>
                    )}

                    {showTranscript && (
                        <div className="absolute bottom-full mb-4 right-0 w-96 max-h-80 overflow-y-auto bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-semibold">Podcast Script</h3>
                                <button onClick={() => setShowTranscript(false)}><Icon name="XMarkIcon" size={16} /></button>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">{transcript}</p>
                        </div>
                    )}

                    {showPlaybackSpeed && (
                        <div className="absolute bottom-full mb-4 right-0 w-32 bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="p-2 border-b border-white/5 mb-1">
                                <h3 className="text-[10px] uppercase tracking-wider font-bold opacity-50">Speed</h3>
                            </div>
                            {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                                <button
                                    key={rate}
                                    onClick={() => {
                                        handlePlaybackRateChange(rate);
                                        setShowPlaybackSpeed(false);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-all text-xs flex justify-between items-center ${playbackRate === rate ? 'bg-primary text-white' : 'hover:bg-white/5'}`}
                                >
                                    <span>{rate}x</span>
                                    {playbackRate === rate && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Floating Glass Control Bar */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 flex flex-row items-center space-x-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={togglePlay}
                        className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-primary text-white shadow-glow active:scale-90 transition-all hover:scale-105"
                    >
                        <Icon name={isPlaying ? 'PauseIcon' : 'PlayIcon'} size={22} variant="solid" />
                    </button>

                    <div className="text-xs font-mono w-10 tabular-nums opacity-90 shrink-0">
                        {formatTime(currentTime)}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col space-y-1.5 justify-center">
                        <div
                            ref={progressRef}
                            onClick={handleSeek}
                            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group"
                        >
                            <div
                                className="absolute top-0 left-0 h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ left: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="text-xs font-mono w-10 tabular-nums opacity-90 shrink-0">
                        {formatTime(duration)}
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                            onClick={() => setShowChapters(!showChapters)}
                            className={`p-2 rounded-lg transition-all ${showChapters ? 'bg-primary text-white shadow-glow' : 'hover:bg-white/10 bg-white/5'}`}
                            title="Chapters"
                        >
                            <Icon name="ListBulletIcon" size={18} />
                        </button>
                        <button
                            onClick={() => {
                                setShowTranscript(!showTranscript);
                                setShowPlaybackSpeed(false);
                                setShowChapters(false);
                            }}
                            className={`p-2 rounded-lg transition-all ${showTranscript ? 'bg-primary text-white shadow-glow' : 'hover:bg-white/10 bg-white/5'}`}
                            title="Script"
                        >
                            <Icon name="DocumentTextIcon" size={18} />
                        </button>
                        <button
                            onClick={() => {
                                setShowPlaybackSpeed(!showPlaybackSpeed);
                                setShowTranscript(false);
                                setShowChapters(false);
                            }}
                            className={`p-2 rounded-lg transition-all h-9 flex items-center justify-center min-w-[36px] ${showPlaybackSpeed ? 'bg-primary text-white shadow-glow' : 'hover:bg-white/10 bg-white/5'}`}
                            title="Playback Speed"
                        >
                            <span className="text-[10px] font-bold">{playbackRate}x</span>
                        </button>
                    </div>

                    <div className="h-6 w-px bg-white/20 mx-1 hidden md:block" />

                    <div className="hidden md:flex items-center space-x-2 w-24">
                        <Icon name="SpeakerWaveIcon" size={16} className="opacity-80" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-card rounded-xl p-6 flex flex-col space-y-6">
            <audio ref={audioRef} src={audioUrl} preload="metadata" crossOrigin="anonymous" />

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-heading font-bold">Podcast Episode</h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowChapters(!showChapters)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-250 ${showChapters ? 'bg-primary text-primary-foreground text-white' : 'bg-muted hover:bg-muted/80'}`}
                            >
                                <Icon name="ListBulletIcon" size={20} />
                                <span className="text-sm font-medium">Chapters</span>
                            </button>
                            <button
                                onClick={() => setShowTranscript(!showTranscript)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-250 ${showTranscript ? 'bg-primary text-primary-foreground text-white' : 'bg-muted hover:bg-muted/80'}`}
                            >
                                <Icon name="DocumentTextIcon" size={20} />
                                <span className="text-sm font-medium">Script</span>
                            </button>
                        </div>
                    </div>

                    {showChapters && (
                        <div className="bg-muted rounded-lg p-4 space-y-2 animate-fade-in">
                            {chapters.length > 0 ? chapters.map((chapter) => (
                                <button
                                    key={chapter.id}
                                    onClick={() => jumpToChapter(chapter.timestamp)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-250 ${currentTime >= chapter.timestamp &&
                                        (chapters[chapters.indexOf(chapter) + 1]?.timestamp > currentTime ||
                                            !chapters[chapters.indexOf(chapter) + 1])
                                        ? 'bg-primary text-primary-foreground shadow-glow'
                                        : 'hover:bg-background'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{chapter.title}</span>
                                        <span className="text-sm opacity-80">{formatTime(chapter.timestamp)}</span>
                                    </div>
                                </button>
                            )) : <p className="text-sm text-muted-foreground text-center py-4">No chapters available</p>}
                        </div>
                    )}

                    {showTranscript && (
                        <div className="bg-muted rounded-lg p-4 animate-fade-in">
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Transcript</h3>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{transcript}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
                <div
                    ref={progressRef}
                    onClick={handleSeek}
                    className="relative h-2 bg-muted rounded-full cursor-pointer group"
                >
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-primary rounded-full transition-all duration-100"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-glow opacity-0 group-hover:opacity-100 transition-opacity duration-250"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-center space-x-4">
                    <button
                        onClick={() => skipTime(-10)}
                        className="p-3 rounded-lg hover:bg-muted transition-all duration-250 active:scale-95"
                        aria-label="Rewind 10 seconds"
                    >
                        <Icon name="BackwardIcon" size={24} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="p-4 rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-250 active:scale-95"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        <Icon name={isPlaying ? 'PauseIcon' : 'PlayIcon'} size={32} variant="solid" />
                    </button>

                    <button
                        onClick={() => skipTime(10)}
                        className="p-3 rounded-lg hover:bg-muted transition-all duration-250 active:scale-95"
                        aria-label="Forward 10 seconds"
                    >
                        <Icon name="ForwardIcon" size={24} />
                    </button>
                </div>

                <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-2 flex-1">
                        <Icon name="SpeakerWaveIcon" size={20} />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        {[0.5, 1, 1.5, 2].map((rate) => (
                            <button
                                key={rate}
                                onClick={() => handlePlaybackRateChange(rate)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-250 ${playbackRate === rate
                                    ? 'bg-primary text-primary-foreground shadow-glow'
                                    : 'bg-muted hover:bg-muted/80'
                                    }`}
                            >
                                {rate}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;