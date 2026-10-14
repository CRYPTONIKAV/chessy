import React from 'react';

interface AnalysisControlsProps {
    index: number; // -1 = starting position, otherwise the move shown
    lastIndex: number; // index of the final move (-1 when there are no moves)
    onChange: (index: number) => void;
}

export default function AnalysisControls({ index, lastIndex, onChange }: AnalysisControlsProps) {
    const atStart = index <= -1;
    const atEnd = index >= lastIndex;
    const buttonClass = 'p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-full transition-all';

    return (
        <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => onChange(-1)} disabled={atStart} className={buttonClass} aria-label="Start of game">⏮</button>
            <button onClick={() => onChange(index - 1)} disabled={atStart} className={buttonClass} aria-label="Previous move">◀</button>
            <button onClick={() => onChange(index + 1)} disabled={atEnd} className={buttonClass} aria-label="Next move">▶</button>
            <button onClick={() => onChange(lastIndex)} disabled={atEnd} className={buttonClass} aria-label="End of game">⏭</button>
        </div>
    );
}
