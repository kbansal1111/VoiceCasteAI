import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const FooterSection = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Demo', href: '#demo' },
        ],
        company: [
            { label: 'About Us', href: '#about' },
            { label: 'Blog', href: '#blog' },
            { label: 'Careers', href: '#careers' },
            { label: 'Contact', href: '#contact' },
        ],
        resources: [
            { label: 'Documentation', href: '#docs' },
            { label: 'API Reference', href: '#api' },
            { label: 'Tutorials', href: '#tutorials' },
            { label: 'Community', href: '#community' },
        ],
        legal: [
            { label: 'Privacy Policy', href: '#privacy' },
            { label: 'Terms of Service', href: '#terms' },
            { label: 'Cookie Policy', href: '#cookies' },
            { label: 'GDPR', href: '#gdpr' },
        ],
    };

    const socialLinks = [
        { icon: 'GlobeAltIcon', label: 'Website', href: '#' },
        { icon: 'EnvelopeIcon', label: 'Email', href: 'mailto:hello@podcastai.com' },
    ];

    return (
        <footer className="relative bg-card border-t border-border">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/landing-page" className="flex items-center space-x-2 group">
                            <div className="relative">
                                <svg
                                    width="40"
                                    height="40"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r="18"
                                        stroke="url(#gradient)"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M15 14C15 12.8954 15.8954 12 17 12H23C24.1046 12 25 12.8954 25 14V26C25 27.1046 24.1046 28 23 28H17C15.8954 28 15 27.1046 15 26V14Z"
                                        fill="url(#gradient)"
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
                            <span className="font-heading text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                                PodcastAI
                            </span>
                        </Link>

                        <p className="text-muted-foreground leading-relaxed max-w-sm">
                            Transform your blogs into engaging AI-powered podcasts with 3D avatars, natural voice synthesis, and interactive chat capabilities.
                        </p>

                        <div className="flex items-center space-x-3">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-250 flex items-center justify-center"
                                >
                                    <Icon name={social.icon as any} size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-heading font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground transition-colors duration-250"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-heading font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground transition-colors duration-250"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-heading font-semibold mb-4">Resources</h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground transition-colors duration-250"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-heading font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-muted-foreground hover:text-foreground transition-colors duration-250"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-muted-foreground">
                            &copy; {currentYear} PodcastAI. All rights reserved.
                        </p>

                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <Icon name="ShieldCheckIcon" size={16} className="text-success" />
                                <span className="text-sm text-muted-foreground">SSL Secured</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Icon name="CpuChipIcon" size={16} className="text-primary" />
                                <span className="text-sm text-muted-foreground">AI Powered</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Icon name="CodeBracketIcon" size={16} className="text-secondary" />
                                <span className="text-sm text-muted-foreground">Open Source</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;