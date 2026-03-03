'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface DemoSectionProps {
    onStartDemo: () => void;
}

const DemoSection = ({ onStartDemo }: DemoSectionProps) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated || !isGenerating) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    setIsGenerating(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [isHydrated, isGenerating]);

    const handleGenerate = () => {
        if (!inputValue.trim()) return;
        setIsGenerating(true);
        setProgress(0);
    };

    const stages = [
        { label: 'Analyzing content', icon: 'MagnifyingGlassIcon', threshold: 20 },
        { label: 'Generating script', icon: 'DocumentTextIcon', threshold: 40 },
        { label: 'Synthesizing voice', icon: 'SpeakerWaveIcon', threshold: 60 },
        { label: 'Creating avatar', icon: 'UserCircleIcon', threshold: 80 },
        { label: 'Finalizing podcast', icon: 'CheckCircleIcon', threshold: 100 },
    ];

    const currentStage = stages.findIndex((stage) => progress < stage.threshold);

    return (
        <section className="relative py-24 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold">
                        Try It{' '}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                            Right Now
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Experience the magic of AI-powered podcast generation in real-time
                    </p>
                </div>

                <div className="bg-card rounded-2xl p-8 shadow-glow-lg border border-border">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="demo-input" className="block text-sm font-medium mb-3 text-muted-foreground">
                                Enter a blog URL or paste your content
                            </label>
                            <div className="relative">
                                <input
                                    id="demo-input"
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="https://example.com/blog-post or paste your text here..."
                                    className="w-full h-14 px-4 pr-12 bg-input rounded-lg border-2 border-transparent focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all duration-250"
                                    disabled={isGenerating}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Icon name="LinkIcon" size={20} className="text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        {!isGenerating ? (
                            <button
                                onClick={handleGenerate}
                                disabled={!inputValue.trim()}
                                className="w-full h-14 px-6 rounded-lg font-medium bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-102 transition-all duration-250 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                            >
                                <Icon name="SparklesIcon" size={20} />
                                <span>Generate Podcast Demo</span>
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-primary transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="space-y-3">
                                    {stages.map((stage, index) => {
                                        const isActive = index === currentStage;
                                        const isCompleted = progress >= stage.threshold;

                                        return (
                                            <div
                                                key={index}
                                                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-250 ${isActive
                                                    ? 'bg-primary/10 border border-primary/20'
                                                    : isCompleted
                                                        ? 'bg-success/10 border border-success/20' : 'bg-muted/50'
                                                    }`}
                                            >
                                                <Icon
                                                    name={stage.icon as any}
                                                    size={20}
                                                    className={
                                                        isActive
                                                            ? 'text-primary animate-pulse'
                                                            : isCompleted
                                                                ? 'text-success' : 'text-muted-foreground'
                                                    }
                                                />
                                                <span
                                                    className={`text-sm font-medium ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    {stage.label}
                                                </span>
                                                {isCompleted && (
                                                    <Icon name="CheckIcon" size={16} className="text-success ml-auto" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {progress === 100 && (
                                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex items-center space-x-3">
                                        <Icon name="CheckCircleIcon" size={24} className="text-success" />
                                        <div className="flex-1">
                                            <p className="font-medium text-success">Podcast Generated Successfully!</p>
                                            <p className="text-sm text-muted-foreground">Ready to play and interact</p>
                                        </div>
                                        <button
                                            onClick={onStartDemo}
                                            className="px-4 py-2 rounded-lg font-medium bg-success text-success-foreground hover:bg-success/90 transition-all duration-250"
                                        >
                                            View
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 grid md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border border-border">
                        <Icon name="ClockIcon" size={24} className="text-primary" />
                        <div>
                            <p className="font-medium">60 Seconds</p>
                            <p className="text-sm text-muted-foreground">Average generation time</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border border-border">
                        <Icon name="LanguageIcon" size={24} className="text-secondary" />
                        <div>
                            <p className="font-medium">4 Languages</p>
                            <p className="text-sm text-muted-foreground">Multilingual support</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border border-border">
                        <Icon name="SparklesIcon" size={24} className="text-accent" />
                        <div>
                            <p className="font-medium">AI-Powered</p>
                            <p className="text-sm text-muted-foreground">Advanced technology</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DemoSection;