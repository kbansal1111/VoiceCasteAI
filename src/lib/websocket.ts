import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';

let socket: Socket | null = null;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30000;

function getSocket(): Socket {
    if (!socket || !socket.connected) {
        socket = io(WS_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: reconnectDelay,
            reconnectionDelayMax: MAX_RECONNECT_DELAY,
        });

        socket.on('connect', () => {
            console.log('WebSocket connected:', socket?.id);
            reconnectDelay = 1000; // reset backoff on success
        });

        socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
            console.warn('WebSocket connection error:', err.message);
            reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
        });
    }
    return socket;
}

export interface JobProgress {
    job_id: string;
    stage: string;
    progress: number;
    message: string;
}

export interface JobComplete {
    job_id: string;
    podcast_id: string;
    audio_url: string;
    video_url: string;
}

export interface JobError {
    job_id: string;
    error: string;
}

/**
 * Subscribe to real-time podcast generation progress.
 * Returns a cleanup function to call on unmount.
 */
export function subscribeToJob(
    jobId: string,
    onProgress: (data: JobProgress) => void,
    onComplete: (data: JobComplete) => void,
    onError: (data: JobError) => void
): () => void {
    const s = getSocket();

    s.emit('subscribe_job', { job_id: jobId });

    const handleProgress = (data: JobProgress) => {
        if (data.job_id === jobId) onProgress(data);
    };
    const handleComplete = (data: JobComplete) => {
        if (data.job_id === jobId) onComplete(data);
    };
    const handleError = (data: JobError) => {
        if (data.job_id === jobId) onError(data);
    };

    s.on('job:progress', handleProgress);
    s.on('job:complete', handleComplete);
    s.on('job:error', handleError);

    // Return cleanup
    return () => {
        s.emit('unsubscribe_job', { job_id: jobId });
        s.off('job:progress', handleProgress);
        s.off('job:complete', handleComplete);
        s.off('job:error', handleError);
    };
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
