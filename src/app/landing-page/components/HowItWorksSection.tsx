import Icon from '@/components/ui/AppIcon';

interface Step {
    number: number;
    title: string;
    description: string;
    icon: string;
    color: string;
}

const HowItWorksSection = () => {
    const steps: Step[] = [
        {
            number: 1,
            title: 'Input Your Content',
            description: 'Paste a blog URL, upload a file, or directly input your text content. Our system supports multiple formats including Markdown and plain text.',
            icon: 'DocumentPlusIcon',
            color: 'from-violet-500 to-purple-500',
        },
        {
            number: 2,
            title: 'Customize Your Podcast',
            description: 'Choose your preferred voice style, language, avatar, and duration. Select from multiple 3D avatar options and voice personalities.',
            icon: 'AdjustmentsHorizontalIcon',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            number: 3,
            title: 'AI Generation Process',
            description: 'Our AI analyzes your content, generates an engaging script, synthesizes natural voice, and creates lip-synced avatar animations.',
            icon: 'CpuChipIcon',
            color: 'from-emerald-500 to-teal-500',
        },
        {
            number: 4,
            title: 'Interact & Share',
            description: 'Listen to your podcast with synchronized transcripts, chat with AI about the content, and share across multiple platforms.',
            icon: 'ShareIcon',
            color: 'from-amber-500 to-orange-500',
        },
    ];

    return (
        <section className="relative py-24 px-4 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold">
                        How It{' '}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                            Works
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Transform your blog into a podcast in four simple steps
                    </p>
                </div>

                <div className="relative">
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-primary -translate-y-1/2" />

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-250 hover:shadow-glow-md space-y-4 h-full">
                                    <div className="flex items-center justify-between">
                                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-glow-md`}>
                                            <Icon name={step.icon as any} size={32} className="text-white" />
                                        </div>

                                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center font-heading font-bold text-xl text-primary-foreground shadow-glow">
                                            {step.number}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-heading font-semibold">{step.title}</h3>

                                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 -translate-y-1/2 z-10">
                                        <Icon name="ChevronRightIcon" size={32} className="text-primary" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-16 bg-card rounded-2xl p-8 border border-border">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-heading font-bold">
                                Advanced AI Technology
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Powered by cutting-edge AI models including Groq API with llama3-8b-8192 for script generation, gTTS for natural voice synthesis, and Rhubarb Lip Sync for realistic avatar animations.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                    Groq AI
                                </span>
                                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                                    gTTS
                                </span>
                                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                                    Rhubarb Lip Sync
                                </span>
                                <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                                    Ready Player Me
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <Icon name="BoltIcon" size={24} className="text-primary" />
                                <p className="font-medium">60s Generation</p>
                                <p className="text-sm text-muted-foreground">Lightning fast processing</p>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <Icon name="GlobeAltIcon" size={24} className="text-secondary" />
                                <p className="font-medium">4 Languages</p>
                                <p className="text-sm text-muted-foreground">Multilingual support</p>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <Icon name="UserGroupIcon" size={24} className="text-accent" />
                                <p className="font-medium">3D Avatars</p>
                                <p className="text-sm text-muted-foreground">Realistic animations</p>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <Icon name="ChatBubbleLeftRightIcon" size={24} className="text-success" />
                                <p className="font-medium">AI Chat</p>
                                <p className="text-sm text-muted-foreground">Interactive experience</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;