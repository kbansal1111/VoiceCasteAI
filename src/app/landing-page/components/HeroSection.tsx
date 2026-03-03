'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface HeroSectionProps {
    onGetStarted: () => void;
    onTryDemo: () => void;
}

const HeroSection = ({ onGetStarted, onTryDemo }: HeroSectionProps) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % 3);
        }, 3000);

        return () => clearInterval(interval);
    }, [isHydrated]);

    const features = [
        { icon: 'SparklesIcon', text: 'AI-Powered Script Generation' },
        { icon: 'MusicalNoteIcon', text: 'Natural Voice Synthesis' },
        { icon: 'ChatBubbleLeftRightIcon', text: 'Interactive Chat Experience' },
    ];

    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative max-w-7xl mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                            <Icon name="BoltIcon" size={16} className="text-primary" />
                            <span className="text-sm font-medium text-primary">Transform Blogs in 60 Seconds</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight">
                            Turn Your Blogs Into{' '}
                            <span className="bg-gradient-primary bg-clip-text text-transparent">
                                AI Podcasts
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Transform written content into engaging audio-visual experiences with 3D animated avatars, natural voice synthesis, and interactive chat capabilities.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onGetStarted}
                                className="group px-8 py-4 rounded-lg font-medium bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-250 active:scale-95 flex items-center justify-center space-x-2"
                            >
                                <span>Start Creating Free</span>
                                <Icon name="ArrowRightIcon" size={20} className="group-hover:translate-x-1 transition-transform duration-250" />
                            </button>

                            <button
                                onClick={onTryDemo}
                                className="px-8 py-4 rounded-lg font-medium bg-muted text-foreground hover:bg-muted/80 transition-all duration-250 flex items-center justify-center space-x-2"
                            >
                                <Icon name="PlayIcon" size={20} />
                                <span>Watch Demo</span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-8 pt-4">
                            <div className="flex items-center space-x-2">
                                <Icon name="CheckCircleIcon" size={20} className="text-success" />
                                <span className="text-sm text-muted-foreground">No credit card required</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Icon name="CheckCircleIcon" size={20} className="text-success" />
                                <span className="text-sm text-muted-foreground">Free forever plan</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative aspect-square max-w-lg mx-auto">
                            <div className="absolute inset-0 bg-gradient-primary rounded-3xl opacity-20 blur-2xl" />

                            <div className="relative bg-card rounded-3xl p-8 shadow-glow-lg border border-border">
                                <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                                    <div className="relative w-48 h-48">
                                        <div className="absolute inset-0 bg-gradient-primary rounded-full animate-pulse" />
                                        <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center">
                                            <Icon name="MicrophoneIcon" size={64} className="text-primary" />
                                        </div>
                                    </div>
                                </div>

                                {isHydrated && (
                                    <div className="mt-6 space-y-3">
                                        {features.map((feature, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${currentFeature === index
                                                    ? 'bg-primary/10 border border-primary/20 scale-105' : 'bg-muted/50'
                                                    }`}
                                            >
                                                <Icon
                                                    name={feature.icon as any}
                                                    size={20}
                                                    className={currentFeature === index ? 'text-primary' : 'text-muted-foreground'}
                                                />
                                                <span
                                                    className={`text-sm font-medium ${currentFeature === index ? 'text-foreground' : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    {feature.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;