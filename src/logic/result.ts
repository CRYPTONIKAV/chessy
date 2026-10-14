import { ResultReason } from '../store/types';

/**
 * Describe a finished game from the player's point of view,
 * e.g. "You won by checkmate", "You resigned", "Draw by stalemate".
 */
export function describeResult(
    result: string | null,
    reason: ResultReason | null,
    orientation: 'white' | 'black'
): string | null {
    if (!result) return null;
    if (result === '1/2-1/2') return reason ? `Draw by ${reason}` : 'Draw';

    const playerWon = (result === '1-0') === (orientation === 'white');
    if (reason === 'resignation') return playerWon ? 'Engine resigned. You won' : 'You resigned';
    const outcome = playerWon ? 'You won' : 'You lost';
    return reason ? `${outcome} by ${reason}` : outcome;
}
