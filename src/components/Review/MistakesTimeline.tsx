import React from 'react';
import { MoveHistory } from '@/store/types';

interface MistakesTimelineProps {
    history: MoveHistory[];
    index: number; // move currently shown (-1 = starting position)
    onChange: (index: number) => void;
}

const getBarColor = (move: MoveHistory) => {
    const grade = move.analysis?.grade;
    if (grade === 'blunder') return 'bg-red-500';
    if (grade === 'mistake') return 'bg-orange-500';
    if (grade === 'inaccuracy') return 'bg-yellow-400';
    if (grade === 'brilliant') return 'bg-purple-500';
    return 'bg-gray-400';
};

export default function MistakesTimeline({ history, index, onChange }: MistakesTimelineProps) {
    return (
        <div className="w-full bg-black/20 rounded-lg p-2 overflow-x-auto">
            <div className="flex items-end h-16 gap-[1px] min-w-max">
                {history.map((move, i) => (
                    <button
                        key={i}
                        onClick={() => onChange(i)}
                        className={`
                        w-4 rounded-t-sm transition-all hover:opacity-80
                        ${getBarColor(move)}
                        ${index === i ? 'opacity-100 ring-2 ring-white/50 z-10' : 'opacity-70'}
                        ${move.analysis?.grade === 'blunder' || move.analysis?.grade === 'brilliant' ? 'h-full' : 'h-8'}
                    `}
                        title={`${i + 1}. ${move.san} - ${move.analysis?.grade || 'Normal'}`}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                <span>Start</span>
                <span>End</span>
            </div>
        </div>
    );
}
