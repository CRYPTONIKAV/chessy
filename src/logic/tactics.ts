import { Chess, Square, PieceSymbol, Color, Piece } from 'chess.js';
import { TacticalFlag } from '../engine/types';

/**
 * Piece values in centipawns for tactical calculations
 */
const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 0, // King has no capture value
};

/**
 * Get all pieces attacking a specific square
 */
function getAttackers(game: Chess, square: Square, attackerColor: Color): Square[] {
    const attackers: Square[] = [];
    const board = game.board();

    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const piece = board[rank][file];
            if (piece && piece.color === attackerColor) {
                const fromSquare = (String.fromCharCode(97 + file) + (8 - rank)) as Square;
                // Check if this piece can move to the target square
                const testGame = new Chess(game.fen());
                const moves = testGame.moves({ square: fromSquare, verbose: true });
                if (moves.some(m => m.to === square)) {
                    attackers.push(fromSquare);
                }
            }
        }
    }
    return attackers;
}

/**
 * Detect hanging pieces (undefended pieces that can be captured)
 */
export function detectHangingPieces(game: Chess): { square: Square; piece: Piece; value: number }[] {
    const hanging: { square: Square; piece: Piece; value: number }[] = [];
    const board = game.board();
    const turn = game.turn();
    const opponentColor = turn === 'w' ? 'b' : 'w';

    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const piece = board[rank][file];
            if (piece && piece.color === opponentColor && piece.type !== 'k') {
                const square = (String.fromCharCode(97 + file) + (8 - rank)) as Square;
                const attackers = getAttackers(game, square, turn);
                const defenders = getAttackers(game, square, opponentColor);

                if (attackers.length > 0 && defenders.length === 0) {
                    hanging.push({
                        square,
                        piece,
                        value: PIECE_VALUES[piece.type]
                    });
                }
            }
        }
    }
    return hanging;
}

/**
 * Detect if a piece is pinned (simplified - checks if moving would expose king)
 */
export function detectPins(game: Chess): Square[] {
    const pins: Square[] = [];
    const turn = game.turn();
    const board = game.board();

    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const piece = board[rank][file];
            if (piece && piece.color === turn && piece.type !== 'k') {
                const square = (String.fromCharCode(97 + file) + (8 - rank)) as Square;

                // Check if the piece can move - if it has very limited moves, might be pinned
                const moves = game.moves({ square, verbose: true });

                // Simple heuristic: if removing this piece would put king in check
                // This is a simplified check
                if (moves.length === 0) {
                    // Piece has no legal moves - likely pinned or blocked
                    pins.push(square);
                }
            }
        }
    }
    return pins;
}

/**
 * Detect back rank weakness
 */
export function detectBackRankWeakness(game: Chess): boolean {
    const turn = game.turn();
    const opponentColor = turn === 'w' ? 'b' : 'w';
    const backRank = opponentColor === 'w' ? '1' : '8';
    const board = game.board();

    // Find opponent's king position
    let kingSquare: Square | null = null;
    for (let file = 0; file < 8; file++) {
        const square = (String.fromCharCode(97 + file) + backRank) as Square;
        const rankIndex = opponentColor === 'w' ? 7 : 0;
        const piece = board[rankIndex][file];
        if (piece && piece.type === 'k' && piece.color === opponentColor) {
            kingSquare = square;
            break;
        }
    }

    if (!kingSquare) return false;

    // Check if king is on back rank and has no escape squares
    const kingRank = parseInt(kingSquare[1]);
    if ((opponentColor === 'w' && kingRank !== 1) || (opponentColor === 'b' && kingRank !== 8)) {
        return false;
    }

    // Check for rooks/queens that could deliver mate
    const attackers = getAttackers(game, kingSquare, turn);
    const hasRookOrQueen = attackers.some(sq => {
        const piece = game.get(sq);
        return piece && (piece.type === 'r' || piece.type === 'q');
    });

    return hasRookOrQueen;
}

/**
 * Main tactical pattern detection function
 */
export function detectTactics(game: Chess, lastMove?: string): TacticalFlag[] {
    void lastMove;
    const flags: TacticalFlag[] = [];

    // Detect hanging pieces
    const hanging = detectHangingPieces(game);
    if (hanging.length > 0) {
        flags.push('hanging');
    }

    // Detect pins
    const pins = detectPins(game);
    if (pins.length > 0) {
        flags.push('pin');
    }

    // Detect back rank weakness
    if (detectBackRankWeakness(game)) {
        flags.push('back_rank');
    }

    // Check for double check
    if (game.isCheck()) {
        // Count attackers on king - if > 1, it's double check
        const turn = game.turn();
        const opponentColor = turn === 'w' ? 'b' : 'w';
        // Finding king square
        const board = game.board();
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                const piece = board[rank][file];
                if (piece && piece.type === 'k' && piece.color === turn) {
                    const kingSquare = (String.fromCharCode(97 + file) + (8 - rank)) as Square;
                    const attackers = getAttackers(game, kingSquare, opponentColor);
                    if (attackers.length > 1) {
                        flags.push('double_check');
                    }
                    break;
                }
            }
        }
    }

    return flags;
}

/**
 * Get tactical description for UI
 */
export function getTacticalDescription(flag: TacticalFlag): string {
    const descriptions: Record<TacticalFlag, string> = {
        hanging: 'Hanging piece detected - an undefended piece can be captured',
        fork: 'Fork opportunity - attack multiple pieces simultaneously',
        pin: 'Pinned piece - a piece cannot move without exposing a more valuable piece',
        skewer: 'Skewer - attack through a valuable piece to a piece behind it',
        discovered_attack: 'Discovered attack - moving one piece reveals an attack from another',
        back_rank: 'Back rank weakness - potential checkmate threat on the back rank',
        double_check: 'Double check - the king is attacked by two pieces',
    };
    return descriptions[flag];
}
