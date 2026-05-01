import { Suspense } from 'react';
import type { Metadata } from 'next';
import PodcastPlayerInteractive from './components/PodcastPlayerInteractive';

export const metadata: Metadata = {
    title: 'Podcast Player - PodcastAI',
    description: 'Experience immersive audio-visual podcasts with 3D animated avatars, synchronized transcripts, and interactive AI-powered chat capabilities for engaging content exploration.',
};

export default function PodcastPlayerPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading Podcast Environment...</div>}>
            <PodcastPlayerInteractive />
        </Suspense>
    );
}