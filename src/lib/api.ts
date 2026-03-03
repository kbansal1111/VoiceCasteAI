import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT ───────────────────────────
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('voicecast_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ─── Response interceptor: handle 401 ─────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('voicecast_token');
                localStorage.removeItem('voicecast_user');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

// ─── Auth helpers ──────────────────────────────────────────────
export function setAuthToken(token: string, user: Record<string, unknown>) {
    localStorage.setItem('voicecast_token', token);
    localStorage.setItem('voicecast_user', JSON.stringify(user));
}

export function clearAuth() {
    localStorage.removeItem('voicecast_token');
    localStorage.removeItem('voicecast_user');
}

export function getStoredUser(): Record<string, unknown> | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('voicecast_user');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('voicecast_token');
}

export default api;
