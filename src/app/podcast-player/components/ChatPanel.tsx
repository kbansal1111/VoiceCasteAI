'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import api from '@/lib/api';

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: number;
}

interface ChatPanelProps {
    podcastId: string;
    podcastContext: string;
    currentTime: number;
    onAction?: (action: string) => void;
}

const ChatPanel = ({ podcastId, podcastContext, currentTime, onAction }: ChatPanelProps) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [suggestedQuestions] = useState([
        "Can you summarize the main points?",
        "What are the key takeaways?",
        "Explain this concept in simpler terms",
        "What examples were mentioned?"
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            scrollToBottom();
        }
    }, [messages, isHydrated]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            type: 'user',
            content: content.trim(),
            timestamp: currentTime,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const { data } = await api.post('/api/chat', {
                podcast_id: podcastId,
                message: content.trim(),
                blog_content: podcastContext,
                context_timestamp: currentTime,
            });

            const aiMessage: Message = {
                id: `ai-${Date.now()}`,
                type: 'ai',
                content: data.reply,
                timestamp: currentTime,
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err: any) {
            const errMsg = err.response?.data?.detail || 'Failed to get AI response. Please try again.';
            const aiMessage: Message = {
                id: `ai-err-${Date.now()}`,
                type: 'ai',
                content: errMsg,
                timestamp: currentTime,
            };
            setMessages((prev) => [...prev, aiMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleVoiceRecord = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', blob, 'voice.webm');
                formData.append('podcast_id', podcastId);

                try {
                    const { data } = await api.post('/api/voice-command', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    if (data.action && data.action !== 'unknown') {
                        onAction?.(data.action);
                    }
                    if (data.transcription && data.action === 'unknown') {
                        await handleSendMessage(data.transcription);
                    }
                } catch {
                    console.warn('Voice command failed');
                }
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);

            // Auto stop after 10 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                }
            }, 10000);
        } catch {
            console.warn('Microphone access denied');
        }
    };

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatTimestamp = (timestamp: number): string => {
        if (!isHydrated) return '';
        const date = new Date(Date.now() - (currentTime - timestamp) * 1000);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (!isHydrated) {
        return (
            <div className="w-full h-full bg-card rounded-xl p-6 animate-pulse">
                <div className="space-y-4">
                    <div className="h-8 bg-muted rounded w-1/2" />
                    <div className="space-y-3">
                        <div className="h-16 bg-muted rounded" />
                        <div className="h-16 bg-muted rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-card rounded-xl flex flex-col">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-heading font-bold">Interactive Chat</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Ask questions about the podcast content
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ChatBubbleLeftRightIcon" size={32} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-heading font-semibold mb-2">Start a Conversation</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Ask questions or use suggested prompts below
                        </p>
                        <div className="space-y-2">
                            {suggestedQuestions.map((question, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSendMessage(question)}
                                    className="w-full text-left px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-all duration-250 text-sm"
                                >
                                    {question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-4 ${message.type === 'user' ? 'bg-gradient-primary text-primary-foreground shadow-glow' : 'bg-muted'
                                }`}
                        >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                                <span>{formatTimestamp(message.timestamp)}</span>
                                <span>at {formatTime(message.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-muted rounded-lg p-4">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-border">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleVoiceRecord}
                        className={`p-3 rounded-lg transition-all duration-250 ${isRecording
                            ? 'bg-destructive text-destructive-foreground animate-pulse'
                            : 'bg-muted hover:bg-muted/80'
                            }`}
                        aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
                    >
                        <Icon name="MicrophoneIcon" size={20} variant={isRecording ? 'solid' : 'outline'} />
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                        placeholder="Ask a question..."
                        className="flex-1 h-12 px-4 bg-input rounded-lg border-2 border-transparent focus:border-primary focus:outline-none transition-all duration-250"
                    />

                    <button
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={!inputValue.trim()}
                        className="p-3 rounded-lg bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-250 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        aria-label="Send message"
                    >
                        <Icon name="PaperAirplaneIcon" size={20} variant="solid" />
                    </button>
                </div>

                {isRecording && (
                    <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-destructive animate-fade-in">
                        <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                        <span>Recording... (auto-stops in 10s)</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPanel;