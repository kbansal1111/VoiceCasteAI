'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import AuthModal from '@/components/common/AuthModal';
import ProgressBreadcrumbs from '@/components/common/ProgressBreadcrumbs';
import ContentInputStep from './ContentInputStep';
import CustomizationStep from './CustomizationStep';
import GenerationStep from './GenerationStep';
import api from '@/lib/api';

interface Step {
    id: string;
    label: string;
    description: string;
}

interface CustomizationOptions {
    voiceStyle: string;
    duration: number;
    language: string;
    avatar: string;
    background: string;
    expressionIntensity: number;
}

const CreatePodcastInteractive = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authType, setAuthType] = useState<'login' | 'register'>('login');

    const [content, setContent] = useState('');
    const [contentUrl, setContentUrl] = useState('');
    const [contentSource, setContentSource] = useState<'url' | 'text' | 'file'>('url');
    const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [podcastId, setPodcastId] = useState<string | null>(null);
    const [generateError, setGenerateError] = useState<string | null>(null);

    const steps: Step[] = [
        {
            id: 'content',
            label: 'Content Input',
            description: 'Add your blog content',
        },
        {
            id: 'customize',
            label: 'Customize',
            description: 'Configure voice and avatar',
        },
        {
            id: 'generate',
            label: 'Generate',
            description: 'Create your podcast',
        },
    ];

    const handleAuthClick = (type: 'login' | 'register') => {
        setAuthType(type);
        setShowAuthModal(true);
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
    };

    const handleContentSubmit = (submittedContent: string, source: 'url' | 'text' | 'file', url?: string) => {
        setContent(submittedContent);
        setContentUrl(url || '');
        setContentSource(source);
        setCompletedSteps([...completedSteps, 0]);
        setCurrentStep(1);
    };

    const handleCustomizationSubmit = async (options: CustomizationOptions) => {
        setCustomizationOptions(options);
        setGenerateError(null);

        try {
            const payload = {
                blog_url: contentSource === 'url' ? contentUrl : undefined,
                blog_text: content,
                avatar_type: options.avatar,
                style: options.voiceStyle,
                language: options.language,
                duration_target: options.duration,
            };
            const { data } = await api.post('/api/podcasts/generate', payload);
            setJobId(data.job_id);
            setPodcastId(data.podcast_id);
            setCompletedSteps([...completedSteps, 1]);
            setCurrentStep(2);
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Failed to start generation. Please log in first.';
            setGenerateError(msg);
            // Show auth modal if 401
            if (err.response?.status === 401) {
                setAuthType('login');
                setShowAuthModal(true);
            }
        }
    };

    const handleGenerationComplete = (podcastId: string) => {
        setCompletedSteps([...completedSteps, 2]);
        setTimeout(() => {
            router.push(`/podcast-player?id=${podcastId}`);
        }, 1500);
    };

    const handleGenerationError = (error: string) => {
        console.error('Generation error:', error);
    };

    const handleGenerationCancel = () => {
        setCurrentStep(1);
    };

    const handleStepClick = (stepIndex: number) => {
        if (stepIndex < currentStep || completedSteps.includes(stepIndex)) {
            setCurrentStep(stepIndex);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header onAuthClick={handleAuthClick} />

            <ProgressBreadcrumbs
                steps={steps}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={handleStepClick}
                allowNavigation={true}
            />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
                <div className="bg-card rounded-xl shadow-glow-md p-6 md:p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
                            {steps[currentStep].label}
                        </h1>
                        <p className="text-muted-foreground">{steps[currentStep].description}</p>
                    </div>

                    {currentStep === 0 && (
                        <ContentInputStep
                            onContentSubmit={handleContentSubmit}
                            initialContent={content}
                            initialSource={contentSource}
                        />
                    )}

                    {currentStep === 1 && (
                        <CustomizationStep
                            onCustomizationSubmit={handleCustomizationSubmit}
                            initialOptions={customizationOptions || undefined}
                        />
                    )}

                    {currentStep === 2 && jobId && podcastId && (
                        <GenerationStep
                            jobId={jobId}
                            podcastId={podcastId}
                            onComplete={handleGenerationComplete}
                            onError={handleGenerationError}
                            onCancel={handleGenerationCancel}
                        />
                    )}
                    {currentStep === 2 && (!jobId || !podcastId) && (
                        <div className="text-center py-8 text-destructive">
                            {generateError || 'Failed to start generation. Please go back and try again.'}
                        </div>
                    )}
                </div>

                {currentStep < 2 && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <div className="flex items-start space-x-3">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                className="flex-shrink-0 mt-0.5"
                            >
                                <path
                                    d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="text-primary"
                                />
                                <path
                                    d="M10 6V10L12 12"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    className="text-primary"
                                />
                            </svg>
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">Quick Tips</p>
                                <ul className="space-y-1 list-disc list-inside">
                                    {currentStep === 0 && (
                                        <>
                                            <li>Longer content (1000+ words) produces better podcasts</li>
                                            <li>Well-structured content with headings works best</li>
                                            <li>You can edit the content before proceeding</li>
                                        </>
                                    )}
                                    {currentStep === 1 && (
                                        <>
                                            <li>Professional voice style works well for technical content</li>
                                            <li>Target 5-7 minutes for optimal engagement</li>
                                            <li>Choose an avatar that matches your content tone</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {showAuthModal && (
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    initialType={authType}
                    onSuccess={handleAuthSuccess}
                />
            )}
        </div>
    );
};

export default CreatePodcastInteractive;