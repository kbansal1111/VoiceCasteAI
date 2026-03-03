import Icon from '@/components/ui/AppIcon';

interface Feature {
    icon: string;
    title: string;
    description: string;
    gradient: string;
}

const FeaturesSection = () => {
    const features: Feature[] = [
        {
            icon: 'DocumentTextIcon',
            title: 'Blog to Podcast Conversion',
            description: 'Transform any blog post into an engaging podcast episode with AI-powered script generation and natural voice synthesis.',
            gradient: 'from-violet-500 to-purple-500',
        },
        {
            icon: 'UserCircleIcon',
            title: '3D Animated Avatars',
            description: 'Bring your podcasts to life with realistic 3D avatars featuring lip-sync technology and expressive animations.',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            icon: 'LanguageIcon',
            title: 'Multilingual Support',
            description: 'Create podcasts in multiple languages including English, Spanish, French, and German with native-quality voice synthesis.',
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            icon: 'ChatBubbleLeftRightIcon',
            title: 'Interactive Chat',
            description: 'Engage with your podcast content through AI-powered chat that answers questions and provides context-aware responses.',
            gradient: 'from-amber-500 to-orange-500',
        },
        {
            icon: 'BoltIcon',
            title: 'Lightning Fast Generation',
            description: 'Generate complete podcast episodes in under 60 seconds with our optimized AI pipeline and cloud infrastructure.',
            gradient: 'from-pink-500 to-rose-500',
        },
        {
            icon: 'CloudArrowUpIcon',
            title: 'Cloud Storage & Distribution',
            description: 'Automatically store and distribute your podcasts with built-in RSS feed generation and social sharing capabilities.',
            gradient: 'from-indigo-500 to-violet-500',
        },
    ];

    return (
        <section className="relative py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold">
                        Powerful Features for{' '}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                            Content Creators
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Everything you need to transform written content into engaging multimedia experiences
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-card rounded-xl p-8 border border-border hover:border-primary/50 transition-all duration-250 hover:shadow-glow-md"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-250" />

                            <div className="relative space-y-4">
                                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-glow-md`}>
                                    <Icon name={feature.icon as any} size={28} className="text-white" />
                                </div>

                                <h3 className="text-xl font-heading font-semibold">{feature.title}</h3>

                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

                                <div className="flex items-center space-x-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                                    <span className="text-sm font-medium">Learn more</span>
                                    <Icon name="ArrowRightIcon" size={16} className="group-hover:translate-x-1 transition-transform duration-250" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;