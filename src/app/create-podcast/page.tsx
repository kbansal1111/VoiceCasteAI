import type { Metadata } from 'next';
import CreatePodcastInteractive from './components/CreatePodcastInteractive';

export const metadata: Metadata = {
    title: 'Create Podcast - PodcastAI',
    description: 'Transform your blog content into engaging AI-powered podcasts with 3D animated avatars, natural voice synthesis, and interactive features in just 60 seconds.',
};

export default function CreatePodcastPage() {
    return <CreatePodcastInteractive />;
}