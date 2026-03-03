'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import api, { setAuthToken } from '@/lib/api';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialType?: 'login' | 'register';
    onSuccess?: () => void;
}

interface FormData {
    email: string;
    password: string;
    confirmPassword?: string;
    name?: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    general?: string;
}

const AuthModal = ({
    isOpen,
    onClose,
    initialType = 'login',
    onSuccess,
}: AuthModalProps) => {
    const [authType, setAuthType] = useState<'login' | 'register'>(initialType);
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setAuthType(initialType);
    }, [initialType]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            modalRef.current?.focus();
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (authType === 'register') {
            if (!formData.name) {
                newErrors.name = 'Name is required';
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const endpoint = authType === 'login' ? '/api/auth/login' : '/api/auth/register';
            const payload = authType === 'login'
                ? { email: formData.email, password: formData.password }
                : { email: formData.email, password: formData.password, name: formData.name };

            const { data } = await api.post(endpoint, payload);
            setAuthToken(data.token, data.user);

            onSuccess?.();
            onClose();

            setFormData({ email: '', password: '', confirmPassword: '', name: '' });
        } catch (error: any) {
            const msg = error.response?.data?.detail || 'An error occurred. Please try again.';
            setErrors({ general: msg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleOAuthLogin = (provider: string) => {
        console.log(`OAuth login with ${provider}`);
    };

    const switchAuthType = () => {
        setAuthType((prev) => (prev === 'login' ? 'register' : 'login'));
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
        });
        setErrors({});
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-background" />

            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative w-full max-w-md bg-card rounded-xl shadow-glow-lg animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-2xl font-heading font-bold">
                        {authType === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-muted transition-all duration-250"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.general && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {errors.general}
                        </div>
                    )}

                    {authType === 'register' && (
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium mb-2 text-muted-foreground"
                            >
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full h-12 px-4 bg-input rounded-lg border-2 transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${errors.name ? 'border-destructive' : 'border-transparent'
                                    }`}
                                placeholder="John Doe"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium mb-2 text-muted-foreground"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full h-12 px-4 bg-input rounded-lg border-2 transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${errors.email ? 'border-destructive' : 'border-transparent'
                                }`}
                            placeholder="you@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium mb-2 text-muted-foreground"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full h-12 px-4 bg-input rounded-lg border-2 transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${errors.password ? 'border-destructive' : 'border-transparent'
                                }`}
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                        )}
                    </div>

                    {authType === 'register' && (
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium mb-2 text-muted-foreground"
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={`w-full h-12 px-4 bg-input rounded-lg border-2 transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${errors.confirmPassword
                                    ? 'border-destructive' : 'border-transparent'
                                    }`}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-destructive">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 px-6 rounded-lg font-medium bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-102 transition-all duration-250 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center space-x-2">
                                <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                                <span>Processing...</span>
                            </span>
                        ) : authType === 'login' ? (
                            'Sign In'
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-card text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleOAuthLogin('google')}
                            className="flex items-center justify-center space-x-2 h-12 px-4 rounded-lg border border-border hover:bg-muted transition-all duration-250"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path
                                    d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M4.405 12.1A6.02 6.02 0 014.09 10c0-.73.118-1.44.314-2.1V5.31H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="font-medium">Google</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleOAuthLogin('github')}
                            className="flex items-center justify-center space-x-2 h-12 px-4 rounded-lg border border-border hover:bg-muted transition-all duration-250"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="font-medium">GitHub</span>
                        </button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        {authType === 'login' ? (
                            <>
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={switchAuthType}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={switchAuthType}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;