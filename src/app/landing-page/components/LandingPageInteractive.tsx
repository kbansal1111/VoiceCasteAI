'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import AuthModal from '@/components/common/AuthModal';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import DemoSection from './DemoSection';
import HowItWorksSection from './HowItWorksSection';
import TestimonialsSection from './TestimonialsSection';
import CTASection from './CTASection';
import FooterSection from './FooterSection';

const LandingPageInteractive = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalType, setAuthModalType] = useState<'login' | 'register'>('register');
    const router = useRouter();

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const handleAuthClick = (type: 'login' | 'register') => {
        setAuthModalType(type);
        setIsAuthModalOpen(true);
    };

    const handleAuthSuccess = () => {
        router.push('/create-podcast');
    };

    const handleGetStarted = () => {
        handleAuthClick('register');
    };

    const handleTryDemo = () => {
        const demoSection = document.getElementById('demo-section');
        if (demoSection) {
            demoSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleStartDemo = () => {
        router.push('/podcast-player');
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header onAuthClick={handleAuthClick} />

            <main className="pt-16">
                <HeroSection onGetStarted={handleGetStarted} onTryDemo={handleTryDemo} />

                <FeaturesSection />

                <div id="demo-section">
                    <DemoSection onStartDemo={handleStartDemo} />
                </div>

                <HowItWorksSection />

                <TestimonialsSection />

                <CTASection onGetStarted={handleGetStarted} />

                <FooterSection />
            </main>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialType={authModalType}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
};

export default LandingPageInteractive;