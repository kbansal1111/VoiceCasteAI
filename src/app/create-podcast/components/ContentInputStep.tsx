'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import api from '@/lib/api';

interface ContentInputStepProps {
    onContentSubmit: (content: string, source: 'url' | 'text' | 'file', url?: string) => void;
    initialContent?: string;
    initialSource?: 'url' | 'text' | 'file';
}

const ContentInputStep = ({
    onContentSubmit,
    initialContent = '',
    initialSource = 'url',
}: ContentInputStepProps) => {
    const [activeTab, setActiveTab] = useState<'url' | 'text' | 'file'>(initialSource);
    const [urlInput, setUrlInput] = useState('');
    const [textInput, setTextInput] = useState(initialContent);
    const [fileName, setFileName] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_CHARS = 50000;
    const MIN_CHARS = 100;

    useEffect(() => {
        if (initialContent) {
            if (initialSource === 'text') {
                setTextInput(initialContent);
                setPreview(initialContent.substring(0, 500));
            } else if (initialSource === 'file') {
                setFileContent(initialContent);
                setPreview(initialContent.substring(0, 500));
            }
        }
    }, [initialContent, initialSource]);

    const validateUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const handleUrlSubmit = async () => {
        setError('');

        if (!urlInput.trim()) {
            setError('Please enter a valid URL');
            return;
        }

        if (!validateUrl(urlInput)) {
            setError('Please enter a valid HTTP or HTTPS URL');
            return;
        }

        setIsLoading(true);

        try {
            const { data } = await api.post('/api/scrape', { url: urlInput });
            const content = data.content as string;
            setPreview(content.substring(0, 500));
            onContentSubmit(content, 'url', urlInput);
        } catch (err: any) {
            const msg = err.response?.data?.detail || 'Failed to fetch content from URL. Please try again.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextSubmit = () => {
        setError('');

        if (!textInput.trim()) {
            setError('Please enter some text content');
            return;
        }

        if (textInput.length < MIN_CHARS) {
            setError(`Content must be at least ${MIN_CHARS} characters`);
            return;
        }

        if (textInput.length > MAX_CHARS) {
            setError(`Content must not exceed ${MAX_CHARS} characters`);
            return;
        }

        setPreview(textInput.substring(0, 500));
        onContentSubmit(textInput, 'text');
    };

    const handleFileSelect = (file: File) => {
        setError('');

        if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
            setError('Only .md and .txt files are supported');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must not exceed 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;

            if (content.length < MIN_CHARS) {
                setError(`File content must be at least ${MIN_CHARS} characters`);
                return;
            }

            if (content.length > MAX_CHARS) {
                setError(`File content must not exceed ${MAX_CHARS} characters`);
                return;
            }

            setFileName(file.name);
            setFileContent(content);
            setPreview(content.substring(0, 500));
            onContentSubmit(content, 'file');
        };
        reader.onerror = () => {
            setError('Failed to read file. Please try again.');
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const getCharCount = () => {
        if (activeTab === 'text') return textInput.length;
        if (activeTab === 'file') return fileContent.length;
        return 0;
    };

    const charCount = getCharCount();
    const isCharCountValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-border">
                <button
                    onClick={() => setActiveTab('url')}
                    className={`px-6 py-3 font-medium transition-all duration-250 border-b-2 ${activeTab === 'url' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center space-x-2">
                        <Icon name="LinkIcon" size={20} />
                        <span>URL</span>
                    </div>
                </button>

                <button
                    onClick={() => setActiveTab('text')}
                    className={`px-6 py-3 font-medium transition-all duration-250 border-b-2 ${activeTab === 'text' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center space-x-2">
                        <Icon name="DocumentTextIcon" size={20} />
                        <span>Text</span>
                    </div>
                </button>

                <button
                    onClick={() => setActiveTab('file')}
                    className={`px-6 py-3 font-medium transition-all duration-250 border-b-2 ${activeTab === 'file' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center space-x-2">
                        <Icon name="ArrowUpTrayIcon" size={20} />
                        <span>File</span>
                    </div>
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start space-x-2">
                    <Icon name="ExclamationTriangleIcon" size={20} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {activeTab === 'url' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">
                            Blog Post URL
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://example.com/blog/post"
                                className="flex-1 h-12 px-4 bg-input rounded-lg border-2 border-transparent transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                            />
                            <button
                                onClick={handleUrlSubmit}
                                disabled={isLoading}
                                className="px-6 h-12 rounded-lg font-medium bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-102 transition-all duration-250 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                                ) : (
                                    'Fetch'
                                )}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Enter the URL of a blog post to automatically extract its content
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'text' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">
                            Paste Your Content
                        </label>
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Paste your blog post content here..."
                            rows={12}
                            className="w-full px-4 py-3 bg-input rounded-lg border-2 border-transparent transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background resize-none custom-scrollbar"
                        />
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground">
                                Minimum {MIN_CHARS} characters required
                            </p>
                            <p
                                className={`text-xs font-medium ${isCharCountValid
                                    ? 'text-success'
                                    : charCount > MAX_CHARS
                                        ? 'text-destructive' : 'text-muted-foreground'
                                    }`}
                            >
                                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleTextSubmit}
                        disabled={!isCharCountValid}
                        className="w-full h-12 px-6 rounded-lg font-medium bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-102 transition-all duration-250 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        Continue with Text
                    </button>
                </div>
            )}

            {activeTab === 'file' && (
                <div className="space-y-4">
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-250 ${isDragging
                            ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".md,.txt"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />

                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon name="DocumentArrowUpIcon" size={32} className="text-primary" />
                            </div>

                            {fileName ? (
                                <div className="text-center">
                                    <p className="font-medium text-foreground">{fileName}</p>
                                    <p className="text-sm text-success mt-1">File uploaded successfully</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {fileContent.length.toLocaleString()} characters
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="font-medium text-foreground">
                                        Drop your file here or click to browse
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Supports .md and .txt files up to 5MB
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 rounded-lg font-medium border border-border hover:bg-muted transition-all duration-250"
                            >
                                {fileName ? 'Choose Different File' : 'Browse Files'}
                            </button>
                        </div>
                    </div>

                    {fileName && fileContent && (
                        <button
                            onClick={() => onContentSubmit(fileContent, 'file')}
                            className="w-full h-12 px-6 rounded-lg font-medium bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-102 transition-all duration-250 active:scale-98"
                        >
                            Continue with File
                        </button>
                    )}
                </div>
            )}

            {preview && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-foreground">Content Preview</h3>
                        <span className="text-xs text-muted-foreground">First 500 characters</span>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {preview}
                        {preview.length >= 500 && '...'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentInputStep;