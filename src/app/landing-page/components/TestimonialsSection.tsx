import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Testimonial {
    name: string;
    role: string;
    company: string;
    content: string;
    image: string;
    alt: string;
    rating: number;
    podcastTitle: string;
}

const TestimonialsSection = () => {
    const testimonials: Testimonial[] = [
        {
            name: 'Sarah Mitchell',
            role: 'Content Creator',
            company: 'Tech Insights Blog',
            content: 'PodcastAI transformed how I repurpose my blog content. What used to take hours now takes less than a minute. The 3D avatars and voice quality are incredibly realistic, and my audience engagement has tripled since I started using it.',
            image: "https://img.rocket.new/generatedImages/rocket_gen_img_1fb6cf439-1763299224286.png",
            alt: 'Professional woman with long brown hair wearing white blazer smiling at camera in modern office',
            rating: 5,
            podcastTitle: 'AI in Modern Business'
        },
        {
            name: 'Marcus Chen',
            role: 'Digital Marketer',
            company: 'Growth Marketing Agency',
            content: 'The multilingual support is a game-changer for our international clients. We can now create podcast versions of our content in four languages simultaneously. The interactive chat feature keeps listeners engaged long after the episode ends.',
            image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a94acfd5-1763299528067.png",
            alt: 'Asian man with short black hair wearing navy blue suit and glasses in corporate setting',
            rating: 5,
            podcastTitle: 'Marketing Strategies 2026'
        },
        {
            name: 'Emily Rodriguez',
            role: 'Podcast Host',
            company: 'Education First Network',
            content: 'As an educator, I needed a way to make my written lessons more accessible. PodcastAI not only converts my content but adds visual elements that help students learn better. The 60-second generation time means I can create content on demand.',
            image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e0a40120-1763296017323.png",
            alt: 'Hispanic woman with curly dark hair wearing red cardigan smiling warmly in classroom environment',
            rating: 5,
            podcastTitle: 'Learning Made Easy'
        }];


    return (
        <section className="relative py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold">
                        Loved by{' '}
                        <span className="bg-gradient-primary bg-clip-text text-transparent">
                            Content Creators
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Join thousands of creators who are transforming their content with AI
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) =>
                        <div
                            key={index}
                            className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-250 hover:shadow-glow-md space-y-4">

                            <div className="flex items-center space-x-1">
                                {[...Array(testimonial.rating)].map((_, i) =>
                                    <Icon key={i} name="StarIcon" size={20} variant="solid" className="text-amber-500" />
                                )}
                            </div>

                            <p className="text-muted-foreground leading-relaxed">{testimonial.content}</p>

                            <div className="pt-4 border-t border-border">
                                <div className="flex items-center space-x-3">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                                        <AppImage
                                            src={testimonial.image}
                                            alt={testimonial.alt}
                                            className="w-full h-full object-cover" />

                                    </div>

                                    <div className="flex-1">
                                        <p className="font-medium">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center space-x-2 text-sm text-muted-foreground">
                                    <Icon name="BuildingOfficeIcon" size={16} />
                                    <span>{testimonial.company}</span>
                                </div>

                                <div className="mt-3 flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
                                    <Icon name="MusicalNoteIcon" size={16} className="text-primary" />
                                    <span className="text-sm font-medium">{testimonial.podcastTitle}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-flex items-center space-x-8 p-6 bg-card rounded-xl border border-border">
                        <div className="text-center">
                            <p className="text-4xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent">
                                10,000+
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Podcasts Created</p>
                        </div>

                        <div className="w-px h-12 bg-border" />

                        <div className="text-center">
                            <p className="text-4xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent">
                                5,000+
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Active Creators</p>
                        </div>

                        <div className="w-px h-12 bg-border" />

                        <div className="text-center">
                            <p className="text-4xl font-heading font-bold bg-gradient-primary bg-clip-text text-transparent">
                                4.9/5
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>);

};

export default TestimonialsSection;