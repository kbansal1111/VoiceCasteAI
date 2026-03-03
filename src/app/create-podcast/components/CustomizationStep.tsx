'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface CustomizationOptions {
    voiceStyle: string;
    duration: number;
    language: string;
    avatar: string;
    background: string;
    expressionIntensity: number;
}

interface CustomizationStepProps {
    onCustomizationSubmit: (options: CustomizationOptions) => void;
    initialOptions?: Partial<CustomizationOptions>;
}

interface VoiceStyle {
    id: string;
    name: string;
    description: string;
    icon: string;
}

interface Language {
    code: string;
    name: string;
    flag: string;
}

interface Avatar {
    id: string;
    name: string;
    thumbnail: string;
    alt: string;
}

const CustomizationStep = ({
    onCustomizationSubmit,
    initialOptions = {}
}: CustomizationStepProps) => {
    const [voiceStyle, setVoiceStyle] = useState(initialOptions.voiceStyle || 'professional');
    const [duration, setDuration] = useState(initialOptions.duration || 5);
    const [language, setLanguage] = useState(initialOptions.language || 'en');
    const [selectedAvatar, setSelectedAvatar] = useState(initialOptions.avatar || 'avatar-1');
    const [background, setBackground] = useState(initialOptions.background || 'gradient-1');
    const [expressionIntensity, setExpressionIntensity] = useState(
        initialOptions.expressionIntensity || 50
    );
    const [showAdvanced, setShowAdvanced] = useState(false);

    const voiceStyles: VoiceStyle[] = [
        {
            id: 'professional',
            name: 'Professional',
            description: 'Clear and authoritative tone',
            icon: 'BriefcaseIcon'
        },
        {
            id: 'conversational',
            name: 'Conversational',
            description: 'Friendly and engaging style',
            icon: 'ChatBubbleLeftRightIcon'
        },
        {
            id: 'energetic',
            name: 'Energetic',
            description: 'Dynamic and enthusiastic delivery',
            icon: 'BoltIcon'
        },
        {
            id: 'calm',
            name: 'Calm',
            description: 'Soothing and relaxed narration',
            icon: 'SparklesIcon'
        }];


    const languages: Language[] = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' }];


    const avatars: Avatar[] = [
        {
            id: 'avatar-1',
            name: 'Professional Male',
            thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1aee6cfa8-1772124404958.png",
            alt: 'Professional male avatar with short brown hair in navy suit against neutral background'
        },
        {
            id: 'avatar-2',
            name: 'Professional Female',
            thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1d3434869-1772124405372.png",
            alt: 'Professional female avatar with long dark hair in business attire with confident expression'
        },
        {
            id: 'avatar-3',
            name: 'Casual Male',
            thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_11a4cb9bc-1763300642433.png",
            alt: 'Casual male avatar with beard wearing casual shirt with friendly smile'
        },
        {
            id: 'avatar-4',
            name: 'Casual Female',
            thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_15ee14c21-1772124402960.png",
            alt: 'Casual female avatar with blonde hair in relaxed outfit with warm expression'
        }];


    const backgrounds = [
        { id: 'gradient-1', name: 'Purple Gradient', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { id: 'gradient-2', name: 'Blue Gradient', preview: 'linear-gradient(135deg, #667eea 0%, #2563eb 100%)' },
        { id: 'gradient-3', name: 'Dark Gradient', preview: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)' },
        { id: 'solid-dark', name: 'Solid Dark', preview: '#0a0a0a' }];


    const handleSubmit = () => {
        onCustomizationSubmit({
            voiceStyle,
            duration,
            language,
            avatar: selectedAvatar,
            background,
            expressionIntensity
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-heading font-semibold mb-4">Voice Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {voiceStyles.map((style) =>
                        <button
                            key={style.id}
                            onClick={() => setVoiceStyle(style.id)}
                            className={`p-4 rounded-lg border-2 transition-all duration-250 text-left ${voiceStyle === style.id ?
                                    'border-primary bg-primary/5 shadow-glow' :
                                    'border-border hover:border-primary/50'}`
                            }>

                            <div className="flex items-start space-x-3">
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${voiceStyle === style.id ? 'bg-primary/20' : 'bg-muted'}`
                                    }>

                                    <Icon
                                        name={style.icon as any}
                                        size={20}
                                        className={voiceStyle === style.id ? 'text-primary' : 'text-muted-foreground'} />

                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">{style.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                                </div>
                            </div>
                        </button>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-heading font-semibold mb-4">Target Duration</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Duration</span>
                        <span className="text-lg font-medium text-foreground">{duration} minutes</span>
                    </div>
                    <input
                        type="range"
                        min="3"
                        max="15"
                        step="1"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />

                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>3 min</span>
                        <span>15 min</span>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-heading font-semibold mb-4">Language</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {languages.map((lang) =>
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`p-4 rounded-lg border-2 transition-all duration-250 ${language === lang.code ?
                                    'border-primary bg-primary/5 shadow-glow' :
                                    'border-border hover:border-primary/50'}`
                            }>

                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{lang.flag}</span>
                                <span className="font-medium text-foreground">{lang.name}</span>
                            </div>
                        </button>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-heading font-semibold mb-4">Avatar Selection</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {avatars.map((avatar) =>
                        <button
                            key={avatar.id}
                            onClick={() => setSelectedAvatar(avatar.id)}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all duration-250 group ${selectedAvatar === avatar.id ?
                                    'border-primary shadow-glow' :
                                    'border-border hover:border-primary/50'}`
                            }>

                            <div className="aspect-square relative">
                                <AppImage
                                    src={avatar.thumbnail}
                                    alt={avatar.alt}
                                    className="w-full h-full object-cover" />

                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/90 backdrop-blur-sm">
                                <p className="text-sm font-medium text-foreground text-center">{avatar.name}</p>
                            </div>
                            {selectedAvatar === avatar.id &&
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <Icon name="CheckIcon" size={16} className="text-primary-foreground" />
                                </div>
                            }
                        </button>
                    )}
                </div>
            </div>

            <div>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-250">

                    <Icon
                        name={showAdvanced ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                        size={20} />

                    <span className="font-medium">Advanced Options</span>
                </button>

                {showAdvanced &&
                    <div className="mt-6 space-y-6 p-6 bg-muted rounded-lg">
                        <div>
                            <h4 className="text-sm font-medium mb-4 text-foreground">Background Style</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {backgrounds.map((bg) =>
                                    <button
                                        key={bg.id}
                                        onClick={() => setBackground(bg.id)}
                                        className={`p-3 rounded-lg border-2 transition-all duration-250 ${background === bg.id ?
                                                'border-primary shadow-glow' :
                                                'border-border hover:border-primary/50'}`
                                        }>

                                        <div
                                            className="w-full h-16 rounded-md mb-2"
                                            style={{ background: bg.preview }} />

                                        <p className="text-xs font-medium text-foreground text-center">{bg.name}</p>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium mb-4 text-foreground">Expression Intensity</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Intensity</span>
                                    <span className="text-sm font-medium text-foreground">{expressionIntensity}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={expressionIntensity}
                                    onChange={(e) => setExpressionIntensity(Number(e.target.value))}
                                    className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer accent-primary" />

                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Subtle</span>
                                    <span>Expressive</span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>

            <button
                onClick={handleSubmit}
                className="w-full h-12 px-6 rounded-lg font-medium bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-102 transition-all duration-250 active:scale-98">

                Generate Podcast
            </button>
        </div>);

};

export default CustomizationStep;