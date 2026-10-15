import { MoveAnalysis, TacticalFlag } from '../engine/types';

export const CLASSIFICATIONS = {
    BRILLIANT: 'brilliant',
    GOOD: 'good',
    INACCURACY: 'inaccuracy',
    MISTAKE: 'mistake',
    BLUNDER: 'blunder',
} as const;

/**
 * Thresholds for move classification (in centipawns)
 */
const THRESHOLDS = {
    GOOD: 20,         // <= 20 cp loss is good
    INACCURACY: 50,   // 20-50 cp loss is inaccuracy
    MISTAKE: 150,     // 50-150 cp loss is mistake
    BLUNDER: 150,     // > 150 cp loss is blunder
};

/**
 * Classify a move based on evaluation delta
 */
export function classifyMove(
    evalBefore: number,
    evalAfter: number,
    playerColor: 'w' | 'b',
    isBestMove: boolean = false,
    hasTacticalGain: boolean = false
): MoveAnalysis['grade'] {
    // Normalize evaluation from active player's perspective
    const scoreBefore = playerColor === 'w' ? evalBefore : -evalBefore;
    const scoreAfter = playerColor === 'w' ? evalAfter : -evalAfter;

    const delta = scoreAfter - scoreBefore;

    // Brilliant: best move with tactical gain or significant improvement
    if (isBestMove && (hasTacticalGain || delta > 50)) {
        return 'brilliant';
    }

    // Good moves don't lose much
    if (delta >= -THRESHOLDS.GOOD) return 'good';

    const absDelta = Math.abs(delta);

    if (absDelta <= THRESHOLDS.INACCURACY) return 'inaccuracy';
    if (absDelta <= THRESHOLDS.MISTAKE) return 'mistake';
    return 'blunder';
}

/**
 * Calculate eval delta (centipawn loss) from the player's perspective
 */
export function calculateEvalDelta(
    evalBefore: number,
    evalAfter: number,
    playerColor: 'w' | 'b'
): number {
    const scoreBefore = playerColor === 'w' ? evalBefore : -evalBefore;
    const scoreAfter = playerColor === 'w' ? evalAfter : -evalAfter;
    return scoreAfter - scoreBefore;
}

/**
 * Create a full move analysis result
 */
export function analyzeMoveResult(
    playerMove: string,
    engineBestMove: string,
    evalBefore: number,
    evalAfter: number,
    playerColor: 'w' | 'b',
    tacticalFlags: TacticalFlag[] = []
): MoveAnalysis {
    const evalDelta = calculateEvalDelta(evalBefore, evalAfter, playerColor);
    const isBestMove = playerMove === engineBestMove;
    const hasTacticalGain = tacticalFlags.length > 0 && evalDelta > 0;

    return {
        playerMove,
        engineBestMove,
        evalBefore,
        evalAfter,
        evalDelta,
        grade: classifyMove(evalBefore, evalAfter, playerColor, isBestMove, hasTacticalGain),
        tacticalFlags,
    };
}
