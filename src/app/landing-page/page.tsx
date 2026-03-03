import type { Metadata } from 'next';
import LandingPageInteractive from './components/LandingPageInteractive';

export const metadata: Metadata = {
    title: 'PodcastAI - Transform Blogs into AI-Powered Podcasts',
    description: 'Convert your blog content into engaging podcast episodes with 3D animated avatars, natural voice synthesis, and interactive chat capabilities in under 60 seconds.',
};

export default function LandingPage() {
    return <LandingPageInteractive />;
}