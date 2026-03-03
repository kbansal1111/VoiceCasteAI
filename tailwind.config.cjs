/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                border: 'var(--color-border)', /* Subtle white border */
                input: 'var(--color-input)', /* gray-800 */
                ring: 'var(--color-ring)', /* violet-600 */
                background: 'var(--color-background)', /* Deep space base */
                foreground: 'var(--color-foreground)', /* gray-50 */
                primary: {
                    DEFAULT: 'var(--color-primary)', /* violet-600 */
                    foreground: 'var(--color-primary-foreground)', /* white */
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)', /* blue-600 */
                    foreground: 'var(--color-secondary-foreground)', /* white */
                },
                destructive: {
                    DEFAULT: 'var(--color-destructive)', /* red-500 */
                    foreground: 'var(--color-destructive-foreground)', /* white */
                },
                muted: {
                    DEFAULT: 'var(--color-muted)', /* gray-800 */
                    foreground: 'var(--color-muted-foreground)', /* slate-400 */
                },
                accent: {
                    DEFAULT: 'var(--color-accent)', /* cyan-500 */
                    foreground: 'var(--color-accent-foreground)', /* Deep space base */
                },
                popover: {
                    DEFAULT: 'var(--color-popover)', /* gray-900 */
                    foreground: 'var(--color-popover-foreground)', /* gray-50 */
                },
                card: {
                    DEFAULT: 'var(--color-card)', /* gray-900 */
                    foreground: 'var(--color-card-foreground)', /* gray-50 */
                },
                success: {
                    DEFAULT: 'var(--color-success)', /* emerald-500 */
                    foreground: 'var(--color-success-foreground)', /* white */
                },
                warning: {
                    DEFAULT: 'var(--color-warning)', /* amber-500 */
                    foreground: 'var(--color-warning-foreground)', /* Deep space base */
                },
                error: {
                    DEFAULT: 'var(--color-error)', /* red-500 */
                    foreground: 'var(--color-error-foreground)', /* white */
                },
            },
            borderRadius: {
                lg: 'var(--radius-lg)',
                md: 'var(--radius-md)',
                sm: 'var(--radius-sm)',
                xl: 'var(--radius-xl)',
            },
            fontFamily: {
                heading: ['JetBrains Mono', 'monospace'],
                body: ['Satoshi', 'sans-serif'],
                caption: ['Inter', 'sans-serif'],
                mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            boxShadow: {
                'glow-sm': '0 0 8px rgba(124, 58, 237, 0.1)',
                'glow-md': '0 0 12px rgba(124, 58, 237, 0.08)',
                'glow': '0 0 20px rgba(124, 58, 237, 0.15)',
                'glow-lg': '0 0 24px rgba(124, 58, 237, 0.2)',
                'glow-xl': '0 0 32px rgba(124, 58, 237, 0.3)',
                'glow-secondary': '0 0 20px rgba(37, 99, 235, 0.15)',
                'glow-accent': '0 0 20px rgba(6, 182, 212, 0.15)',
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
                'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            transitionDuration: {
                '250': '250ms',
                '150': '150ms',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.15)' },
                    '50%': { boxShadow: '0 0 32px rgba(124, 58, 237, 0.3)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                'slide-in': 'slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            },
        },
    },
    plugins: [],
}