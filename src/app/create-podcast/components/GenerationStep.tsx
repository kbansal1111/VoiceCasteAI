'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { subscribeToJob } from '@/lib/websocket';

interface GenerationStage {
    id: string;
    name: string;
    description: string;
    progress: number;
    status: 'pending' | 'processing' | 'completed' | 'error';
}

interface GenerationStepProps {
    jobId: string;
    podcastId: string;
    onComplete: (podcastId: string) => void;
    onError: (error: string) => void;
    onCancel: () => void;
}

// Map backend stage names → frontend stage index
const STAGE_MAP: Record<string, number> = {
    scraping: 0,
    scripting: 0,
    audio: 1,
    lipsync: 2,
    video: 2,
    uploading: 3,
    complete: 3,
};

const GenerationStep = ({ jobId, podcastId, onComplete, onError, onCancel }: GenerationStepProps) => {
    const [stages, setStages] = useState<GenerationStage[]>([
        {
            id: 'script',
            name: 'Script Generation',
            description: 'AI is analyzing your content and creating an engaging script',
            progress: 0,
            status: 'pending',
        },
        {
            id: 'voice',
            name: 'Voice Synthesis',
            description: 'Converting script to natural-sounding speech',
            progress: 0,
            status: 'pending',
        },
        {
            id: 'avatar',
            name: 'Avatar Rendering',
            description: 'Creating lip-synced 3D avatar animation',
            progress: 0,
            status: 'pending',
        },
        {
            id: 'finalize',
            name: 'Finalizing',
            description: 'Combining audio and video, preparing your podcast',
            progress: 0,
            status: 'pending',
        },
    ]);

    const [overallProgress, setOverallProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('Connecting to generation pipeline...');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const cleanup = subscribeToJob(
            jobId,
            // onProgress
            (data) => {
                const stageIdx = STAGE_MAP[data.stage] ?? 0;
                setStatusMessage(data.message);
                setOverallProgress(data.progress);

                setStages((prev) =>
                    prev.map((stage, idx) => {
                        if (idx < stageIdx) {
                            return { ...stage, status: 'completed', progress: 100 };
                        } else if (idx === stageIdx) {
                            return { ...stage, status: 'processing', progress: data.progress };
                        }
                        return stage;
                    })
                );
            },
            // onComplete
            (data) => {
                setOverallProgress(100);
                setStatusMessage('Podcast generated successfully!');
                setStages((prev) => prev.map((s) => ({ ...s, status: 'completed', progress: 100 })));
                setTimeout(() => onComplete(data.podcast_id), 1500);
            },
            // onError
            (data) => {
                setStatusMessage(`Error: ${data.error}`);
                setStages((prev) =>
                    prev.map((s) => s.status === 'processing' ? { ...s, status: 'error' } : s)
                );
                onError(data.error);
            }
        );
        cleanupRef.current = cleanup;
        return () => cleanup();
    }, [jobId]);

    const handleCancel = () => {
        if (showCancelConfirm) {
            cleanupRef.current?.();
            onCancel();
        } else {
            setShowCancelConfirm(true);
            setTimeout(() => setShowCancelConfirm(false), 3000);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-muted"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallProgress / 100)}`}
                            className="transition-all duration-500"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7c3aed" />
                                <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent">
                            {Math.round(overallProgress)}%
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-heading font-semibold text-foreground">
                        Generating Your Podcast
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">{statusMessage}</p>
                </div>
            </div>

            <div className="space-y-4">
                {stages.map((stage, index) => (
                    <div
                        key={stage.id}
                        className={`p-4 rounded-lg border-2 transition-all duration-250 ${stage.status === 'processing' ? 'border-primary bg-primary/5 shadow-glow'
                            : stage.status === 'completed' ? 'border-success bg-success/5'
                                : stage.status === 'error' ? 'border-destructive bg-destructive/5' : 'border-border'
                            }`}
                    >
                        <div className="flex items-start space-x-4">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${stage.status === 'processing' ? 'bg-primary/20'
                                    : stage.status === 'completed' ? 'bg-success/20'
                                        : stage.status === 'error' ? 'bg-destructive/20' : 'bg-muted'
                                    }`}
                            >
                                {stage.status === 'completed' ? (
                                    <Icon name="CheckIcon" size={20} className="text-success" />
                                ) : stage.status === 'error' ? (
                                    <Icon name="XMarkIcon" size={20} className="text-destructive" />
                                ) : stage.status === 'processing' ? (
                                    <Icon name="ArrowPathIcon" size={20} className="text-primary animate-spin" />
                                ) : (
                                    <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-foreground">{stage.name}</h4>
                                    {stage.status === 'processing' && (
                                        <span className="text-sm font-medium text-primary">
                                            {Math.round(stage.progress)}%
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-muted-foreground">{stage.description}</p>

                                {(stage.status === 'processing' || stage.status === 'completed') && (
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${stage.status === 'completed' ? 'bg-success' : 'bg-gradient-primary'
                                                }`}
                                            style={{ width: `${stage.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center space-x-4">
                <button
                    onClick={handleCancel}
                    className={`px-6 py-2 rounded-lg font-medium border transition-all duration-250 ${showCancelConfirm
                        ? 'border-destructive text-destructive hover:bg-destructive/10' : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                >
                    {showCancelConfirm ? 'Click Again to Confirm' : 'Cancel Generation'}
                </button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start space-x-3">
                    <Icon name="InformationCircleIcon" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Generation in Progress</p>
                        <p>
                            This process typically takes 60-90 seconds. You can safely leave this page and return
                            later - we'll save your progress.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerationStep;