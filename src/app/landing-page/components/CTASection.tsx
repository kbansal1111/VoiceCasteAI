'use client';

import Icon from '@/components/ui/AppIcon';

interface CTASectionProps {
    onGetStarted: () => void;
}

const CTASection = ({ onGetStarted }: CTASectionProps) => {
    return (
        <section className="relative py-24 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="relative bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

                    <div className="relative text-center space-y-8">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                            <Icon name="SparklesIcon" size={16} className="text-white" />
                            <span className="text-sm font-medium text-white">Limited Time Offer</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">
                            Start Creating Amazing Podcasts Today
                        </h2>

                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            Join thousands of content creators who are transforming their blogs into engaging multimedia experiences with AI-powered technology.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={onGetStarted}
                                className="group px-8 py-4 rounded-lg font-medium bg-white text-primary shadow-glow-lg hover:shadow-glow-xl hover:scale-105 transition-all duration-250 active:scale-95 flex items-center space-x-2"
                            >
                                <span>Get Started Free</span>
                                <Icon name="ArrowRightIcon" size={20} className="group-hover:translate-x-1 transition-transform duration-250" />
                            </button>

                            <button className="px-8 py-4 rounded-lg font-medium bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all duration-250 flex items-center space-x-2">
                                <Icon name="PlayCircleIcon" size={20} />
                                <span>Watch Tutorial</span>
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                            <div className="flex items-center space-x-2 text-white/90">
                                <Icon name="CheckCircleIcon" size={20} />
                                <span className="text-sm">No credit card required</span>
                            </div>

                            <div className="hidden sm:block w-px h-4 bg-white/20" />

                            <div className="flex items-center space-x-2 text-white/90">
                                <Icon name="CheckCircleIcon" size={20} />
                                <span className="text-sm">Free forever plan</span>
                            </div>

                            <div className="hidden sm:block w-px h-4 bg-white/20" />

                            <div className="flex items-center space-x-2 text-white/90">
                                <Icon name="CheckCircleIcon" size={20} />
                                <span className="text-sm">Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div className="bg-card rounded-xl p-6 border border-border text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Icon name="ShieldCheckIcon" size={24} className="text-primary" />
                        </div>
                        <h3 className="font-heading font-semibold">Secure & Private</h3>
                        <p className="text-sm text-muted-foreground">Your content is encrypted and protected with enterprise-grade security</p>
                    </div>

                    <div className="bg-card rounded-xl p-6 border border-border text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                            <Icon name="CloudIcon" size={24} className="text-secondary" />
                        </div>
                        <h3 className="font-heading font-semibold">Cloud Storage</h3>
                        <p className="text-sm text-muted-foreground">Unlimited storage for all your podcasts with automatic backups</p>
                    </div>

                    <div className="bg-card rounded-xl p-6 border border-border text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                            <Icon name="UserGroupIcon" size={24} className="text-accent" />
                        </div>
                        <h3 className="font-heading font-semibold">24/7 Support</h3>
                        <p className="text-sm text-muted-foreground">Get help anytime from our dedicated support team</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;