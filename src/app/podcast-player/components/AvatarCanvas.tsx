'use client';

import { useEffect, useRef, useState } from 'react';

interface AvatarCanvasProps {
    isPlaying: boolean;
    currentTime: number;
    audioData?: number[];
}

const AvatarCanvas = ({ isPlaying, currentTime, audioData = [] }: AvatarCanvasProps) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [mouthOpenness, setMouthOpenness] = useState(0);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated || !isPlaying) return;

        const interval = setInterval(() => {
            const avgAmplitude = audioData.length > 0
                ? audioData.reduce((a, b) => a + b, 0) / audioData.length
                : Math.random() * 0.5;
            setMouthOpenness(avgAmplitude);
        }, 100);

        return () => clearInterval(interval);
    }, [isHydrated, isPlaying, audioData]);

    if (!isHydrated) {
        return (
            <div className="w-full h-full bg-muted rounded-xl animate-pulse flex items-center justify-center">
                <div className="w-32 h-32 bg-muted-foreground/20 rounded-full" />
            </div>
        );
    }

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-full bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-xl overflow-hidden"
        >
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                    <svg
                        width="256"
                        height="256"
                        viewBox="0 0 256 256"
                        className="drop-shadow-glow-primary"
                    >
                        <defs>
                            <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7c3aed" />
                                <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        <circle
                            cx="128"
                            cy="100"
                            r="60"
                            fill="url(#avatarGradient)"
                            filter="url(#glow)"
                            className={isPlaying ? 'animate-pulse' : ''}
                        />

                        <ellipse
                            cx="110"
                            cy="90"
                            rx="8"
                            ry="12"
                            fill="#0a0a0a"
                        />
                        <ellipse
                            cx="146"
                            cy="90"
                            rx="8"
                            ry="12"
                            fill="#0a0a0a"
                        />

                        <path
                            d={`M 108 120 Q 128 ${120 + mouthOpenness * 20} 148 120`}
                            stroke="#0a0a0a"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                        />

                        <path
                            d="M 90 75 Q 100 70 110 75"
                            stroke="#0a0a0a"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <path
                            d="M 146 75 Q 156 70 166 75"
                            stroke="#0a0a0a"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />

                        <ellipse
                            cx="128"
                            cy="180"
                            rx="40"
                            ry="60"
                            fill="url(#avatarGradient)"
                            opacity="0.8"
                        />
                    </svg>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avatar Status</span>
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                        <span className="text-foreground font-medium">
                            {isPlaying ? 'Speaking' : 'Idle'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvatarCanvas;