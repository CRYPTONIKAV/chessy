import React, { useEffect, useState } from 'react';
import { MoveAnalysis } from '../engine/types';

interface MoveFeedbackOverlayProps {
    // Grade to flash on the board. The parent decides what the current level
    // allows; null shows nothing.
    analysis: MoveAnalysis | null;
}

const DISPLAY_MS = 2500;

export default function MoveFeedbackOverlay({ analysis }: MoveFeedbackOverlayProps) {
    // Show each new analysis once, for a few seconds
    const [shown, setShown] = useState<MoveAnalysis | null>(analysis);
    const [prevAnalysis, setPrevAnalysis] = useState<MoveAnalysis | null>(analysis);
    if (analysis !== prevAnalysis) {
        setPrevAnalysis(analysis);
        setShown(analysis);
    }

    useEffect(() => {
        if (!shown) return;
        const timer = setTimeout(() => setShown(null), DISPLAY_MS);
        return () => clearTimeout(timer);
    }, [shown]);

    if (!shown) return null;

    const { grade } = shown;

    const getBadgeStyle = (grade: string) => {
        switch (grade) {
            case 'brilliant':
                return {
                    bg: 'bg-teal-500/20',
                    border: 'border-teal-400',
                    text: 'text-teal-100',
                    glow: 'shadow-[0_0_30px_rgba(45,212,191,0.6)]',
                    icon: '💎',
                    label: 'Brilliant'
                };
            case 'good':
                return {
                    bg: 'bg-emerald-500/20',
                    border: 'border-emerald-400',
                    text: 'text-emerald-100',
                    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.4)]',
                    icon: '✅',
                    label: 'Good'
                };
            case 'inaccuracy':
                return {
                    bg: 'bg-yellow-500/20',
                    border: 'border-yellow-400',
                    text: 'text-yellow-100',
                    glow: 'shadow-[0_0_20px_rgba(250,204,21,0.4)]',
                    icon: '⚠️',
                    label: 'Inaccuracy'
                };
            case 'mistake':
                return {
                    bg: 'bg-orange-500/20',
                    border: 'border-orange-400',
                    text: 'text-orange-100',
                    glow: 'shadow-[0_0_20px_rgba(251,146,60,0.5)]',
                    icon: '❌',
                    label: 'Mistake'
                };
            case 'blunder':
                return {
                    bg: 'bg-red-600/30',
                    border: 'border-red-500',
                    text: 'text-red-100',
                    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.7)]',
                    icon: '💀',
                    label: 'Blunder'
                };
            default:
                return null;
        }
    };

    const style = getBadgeStyle(grade);
    if (!style) return null;

    return (
        <div className="absolute top-4 right-4 pointer-events-none z-50 flex flex-col items-end">
            <div
                className={`
                    backdrop-blur-md px-4 py-2 rounded-xl border ${style.bg} ${style.border} ${style.text} ${style.glow}
                    flex items-center gap-3
                `}
                role="status"
            >
                <span className="text-2xl filter drop-shadow-lg">{style.icon}</span>
                <div>
                    <div className="font-bold text-lg tracking-wide uppercase drop-shadow-md">{style.label}</div>
                    {/* Optional: Add delta or simple text */}
                </div>
            </div>
        </div>
    );
}
