import type { Metadata } from 'next';
import PodcastPlayerInteractive from './components/PodcastPlayerInteractive';

export const metadata: Metadata = {
    title: 'Podcast Player - PodcastAI',
    description: 'Experience immersive audio-visual podcasts with 3D animated avatars, synchronized transcripts, and interactive AI-powered chat capabilities for engaging content exploration.',
};

export default function PodcastPlayerPage() {
    return <PodcastPlayerInteractive />;
}