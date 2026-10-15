import { MoveHistory } from '@/store/types';

export type MistakeCategory = 'tactical' | 'opening' | 'middlegame' | 'endgame';

export interface CategorizedMistake {
    move: MoveHistory;
    moveNumber: number;
    category: MistakeCategory;
}

export interface GroupedMistakes {
    tactical: CategorizedMistake[];
    opening: CategorizedMistake[];
    middlegame: CategorizedMistake[];
    endgame: CategorizedMistake[];
}

/**
 * Categorize a move based on game phase and characteristics
 */
export function categorizeMove(move: MoveHistory, moveNumber: number, totalPieces: number): MistakeCategory {
    // Tactical errors take priority if tactical flags exist
    if (move.tacticalFlags && move.tacticalFlags.length > 0) {
        return 'tactical';
    }

    // Opening phase: first 15 moves
    const moveCount = Math.floor(moveNumber / 2) + 1;
    if (moveCount <= 15) {
        return 'opening';
    }

    // Endgame: move 40+ or 8 or fewer pieces on board
    if (moveCount >= 40 || totalPieces <= 8) {
        return 'endgame';
    }

    // Default to middlegame
    return 'middlegame';
}

/**
 * Count total pieces on the board from FEN
 */
function countPiecesFromFEN(fen: string): number {
    const position = fen.split(' ')[0];
    let count = 0;
    for (const char of position) {
        if (char >= 'A' && char <= 'Z' || char >= 'a' && char <= 'z') {
            count++;
        }
    }
    return count;
}

/**
 * Group mistakes by category
 */
export function groupMistakes(history: MoveHistory[]): GroupedMistakes {
    const grouped: GroupedMistakes = {
        tactical: [],
        opening: [],
        middlegame: [],
        endgame: []
    };

    history.forEach((move, index) => {
        // Only process mistakes and blunders
        if (move.analysis?.grade === 'mistake' || move.analysis?.grade === 'blunder') {
            const totalPieces = countPiecesFromFEN(move.fen);
            const category = categorizeMove(move, index, totalPieces);

            grouped[category].push({
                move,
                moveNumber: index,
                category
            });
        }
    });

    return grouped;
}

/**
 * Get category display information
 */
export function getCategoryInfo(category: MistakeCategory) {
    const info = {
        tactical: {
            name: 'Tactical Errors',
            description: 'Calculation mistakes and tactical oversights',
            color: 'from-red-500 to-pink-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            textColor: 'text-red-400',
            icon: '⚡'
        },
        opening: {
            name: 'Opening Mistakes',
            description: 'Early game development and theory errors',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            textColor: 'text-blue-400',
            icon: '📚'
        },
        middlegame: {
            name: 'Middlegame Planning',
            description: 'Strategic and positional mistakes',
            color: 'from-purple-500 to-indigo-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            textColor: 'text-purple-400',
            icon: '🎯'
        },
        endgame: {
            name: 'Endgame Technique',
            description: 'Technical endgame execution errors',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            textColor: 'text-green-400',
            icon: '♔'
        }
    };

    return info[category];
}
