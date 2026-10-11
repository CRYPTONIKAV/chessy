import { TacticalFlag } from '../engine/types';

export interface Arrow {
    from: string;
    to: string;
    color: string;
    style?: 'solid' | 'dashed';
}

export function getArrowColorByLevel(level: string): string {
    switch (level) {
        case 'beginner':
            return 'rgba(68, 160, 107, 0.9)'; // success (green)
        case 'intermediate':
            return 'rgba(6, 182, 212, 0.9)'; // secondary (cyan)
        case 'advanced':
            return 'rgba(244, 114, 182, 0.9)'; // accent (pink)
        default:
            return 'rgba(212, 77, 92, 0.9)'; // error (red)
    }
}

export function shouldShowBestMoveArrow(level: string): boolean {
    return level === 'beginner';
}

export function createBestMoveArrow(from: string, to: string, level: string): Arrow | null {
    if (!shouldShowBestMoveArrow(level)) return null;
    return {
        from,
        to,
        color: getArrowColorByLevel(level),
        style: 'solid',
    };
}

export function createTacticalArrows(tactics: TacticalFlag[], move: { from: string; to: string }, level: string): Arrow[] {
    // Example: show a red arrow for pins, blue for forks, etc.
    const arrows: Arrow[] = [];
    for (const tactic of tactics) {
        if (tactic === 'pin') {
            arrows.push({ from: move.from, to: move.to, color: '#d50000', style: 'dashed' });
        } else if (tactic === 'fork') {
            arrows.push({ from: move.from, to: move.to, color: '#2962ff', style: 'dashed' });
        } else if (tactic === 'skewer') {
            arrows.push({ from: move.from, to: move.to, color: '#ff6d00', style: 'dashed' });
        } // Add more as needed
    }
    return arrows;
}

// Usage in UI: filter arrows by shouldShowBestMoveArrow(level) and render with appropriate color/style.
