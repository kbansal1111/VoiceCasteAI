'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Step {
    id: string;
    label: string;
    description?: string;
}

interface ProgressBreadcrumbsProps {
    steps: Step[];
    currentStep: number;
    completedSteps?: number[];
    onStepClick?: (stepIndex: number) => void;
    allowNavigation?: boolean;
}

const ProgressBreadcrumbs = ({
    steps,
    currentStep,
    completedSteps = [],
    onStepClick,
    allowNavigation = true,
}: ProgressBreadcrumbsProps) => {
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    const getStepStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
        if (completedSteps.includes(index)) return 'completed';
        if (index === currentStep) return 'current';
        return 'upcoming';
    };

    const canNavigateToStep = (index: number): boolean => {
        if (!allowNavigation) return false;
        return index <= currentStep || completedSteps.includes(index);
    };

    const handleStepClick = (index: number) => {
        if (canNavigateToStep(index) && onStepClick) {
            onStepClick(index);
        }
    };

    return (
        <div className="w-full bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <nav aria-label="Progress">
                    <ol className="flex items-center justify-between space-x-2 md:space-x-4 overflow-x-auto custom-scrollbar pb-2">
                        {steps.map((step, index) => {
                            const status = getStepStatus(index);
                            const isClickable = canNavigateToStep(index);
                            const isHovered = hoveredStep === index;

                            return (
                                <li
                                    key={step.id}
                                    className="flex items-center flex-shrink-0"
                                    onMouseEnter={() => setHoveredStep(index)}
                                    onMouseLeave={() => setHoveredStep(null)}
                                >
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => handleStepClick(index)}
                                            disabled={!isClickable}
                                            className={`group relative flex items-center transition-all duration-250 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                                                }`}
                                            aria-current={status === 'current' ? 'step' : undefined}
                                        >
                                            <div
                                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-250 ${status === 'completed'
                                                        ? 'bg-success border-success shadow-glow-accent'
                                                        : status === 'current' ? 'bg-primary border-primary shadow-glow' : 'bg-muted border-border'
                                                    } ${isClickable && isHovered
                                                        ? 'scale-110 shadow-glow-lg'
                                                        : ''
                                                    }`}
                                            >
                                                {status === 'completed' ? (
                                                    <Icon
                                                        name="CheckIcon"
                                                        size={20}
                                                        className="text-success-foreground"
                                                    />
                                                ) : (
                                                    <span
                                                        className={`font-heading font-semibold ${status === 'current' ? 'text-primary-foreground' : 'text-muted-foreground'
                                                            }`}
                                                    >
                                                        {index + 1}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="ml-3 hidden md:block">
                                                <p
                                                    className={`text-sm font-medium transition-colors duration-250 ${status === 'current' ? 'text-foreground'
                                                            : status === 'completed' ? 'text-success' : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    {step.label}
                                                </p>
                                                {step.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {step.description}
                                                    </p>
                                                )}
                                            </div>

                                            {isHovered && step.description && (
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-popover rounded-lg shadow-glow-md z-10 whitespace-nowrap md:hidden animate-fade-in">
                                                    <p className="text-xs text-popover-foreground">
                                                        {step.label}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            )}
                                        </button>

                                        {index < steps.length - 1 && (
                                            <div
                                                className={`w-8 md:w-16 h-0.5 mx-2 transition-all duration-250 ${completedSteps.includes(index) || index < currentStep
                                                        ? 'bg-success' : 'bg-border'
                                                    }`}
                                            />
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                <div className="mt-4 md:hidden">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                        <span className="font-medium text-foreground">
                            {steps[currentStep].label}
                        </span>
                    </div>
                    {steps[currentStep].description && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {steps[currentStep].description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressBreadcrumbs;