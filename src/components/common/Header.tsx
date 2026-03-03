'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { getStoredUser, clearAuth, isAuthenticated } from '@/lib/api';

interface HeaderProps {
    onAuthClick?: (type: 'login' | 'register') => void;
}

const Header = ({ onAuthClick }: HeaderProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Hydrate auth state on mount
        const storedUser = getStoredUser();
        setUser(storedUser);
        setLoggedIn(isAuthenticated());
    }, [pathname]); // Re-check on navigation or login redirect

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const navigationItems = [
        { label: 'Home', path: '/', icon: 'HomeIcon' },
        { label: 'Create', path: '/create-podcast', icon: 'PlusCircleIcon' },
        { label: 'Library', path: '/account', icon: 'MusicalNoteIcon' },
    ];

    const isActive = (path: string) => pathname === path;

    const handleAuthClick = (type: 'login' | 'register') => {
        setIsMobileMenuOpen(false);
        onAuthClick?.(type);
    };

    const handleLogout = () => {
        clearAuth();
        setUser(null);
        setLoggedIn(false);
        router.push('/');
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-250 ${isScrolled ? 'bg-card shadow-glow-md' : 'bg-card'
                }`}
        >
            <nav className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center space-x-2 group transition-transform duration-250 hover:scale-105 shrink-0"
                >
                    <div className="relative">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="transition-all duration-250"
                        >
                            <circle
                                cx="20"
                                cy="20"
                                r="18"
                                stroke="url(#gradient)"
                                strokeWidth="2"
                                className="group-hover:drop-shadow-glow"
                            />
                            <path
                                d="M15 14C15 12.8954 15.8954 12 17 12H23C24.1046 12 25 12.8954 25 14V26C25 27.1046 24.1046 28 23 28H17C15.8954 28 15 27.1046 15 26V14Z"
                                fill="url(#gradient)"
                                className="group-hover:opacity-90"
                            />
                            <circle cx="20" cy="20" r="3" fill="#0a0a0a" />
                            <defs>
                                <linearGradient
                                    id="gradient"
                                    x1="0"
                                    y1="0"
                                    x2="40"
                                    y2="40"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#7c3aed" />
                                    <stop offset="1" stopColor="#2563eb" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-250 ${isActive(item.path)
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon name={item.icon as any} size={18} />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center space-x-3 shrink-0">
                    {loggedIn ? (
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="text-sm font-bold text-foreground">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <Link
                                    href="/account"
                                    className="text-xs font-bold hover:underline"
                                >
                                    My Account
                                </Link>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                title="Logout"
                            >
                                <Icon name="ArrowRightOnRectangleIcon" size={18} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => handleAuthClick('login')}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-all duration-250"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => handleAuthClick('register')}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-102 transition-all duration-250 active:scale-98"
                            >
                                Get Started
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-muted transition-all duration-250"
                    aria-label="Toggle menu"
                >
                    <Icon
                        name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
                        size={24}
                    />
                </button>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-16 z-[1500] md:hidden bg-background">
                    <div className="flex flex-col h-full px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center space-x-3 px-6 py-4 rounded-lg font-medium transition-all duration-250 ${isActive(item.path)
                                    ? 'bg-primary text-primary-foreground shadow-glow'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Icon name={item.icon as any} size={24} />
                                <span>{item.label}</span>
                            </Link>
                        ))}

                        <div className="pt-6 mt-6 border-t border-border space-y-3">
                            <button
                                onClick={() => handleAuthClick('login')}
                                className="w-full px-6 py-4 rounded-lg font-medium text-foreground bg-muted hover:bg-muted/80 transition-all duration-250"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => handleAuthClick('register')}
                                className="w-full px-6 py-4 rounded-lg font-medium bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg transition-all duration-250 active:scale-98"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;