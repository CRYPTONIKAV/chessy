import { GameStore, MoveHistory } from '@/store/types';

export function generateJSON(store: GameStore): string {
    const data = {
        fen: store.fen,
        turn: store.turn,
        result: store.result,
        history: store.history,
        mistakes: store.mistakes,
        difficulty: store.difficulty,
        orientation: store.orientation,
        date: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
}

export function generatePGN(store: GameStore): string {
    const { history, result, resultReason, orientation, difficulty } = store;
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');

    let pgn = '';

    // Headers
    pgn += `[Event "Chessy Game"]\n`;
    pgn += `[Site "Chessy App"]\n`;
    pgn += `[Date "${date}"]\n`;
    pgn += `[Round "-"]\n`;
    pgn += `[White "${orientation === 'white' ? 'Player' : `Engine (${difficulty})`}"]\n`;
    pgn += `[Black "${orientation === 'black' ? 'Player' : `Engine (${difficulty})`}"]\n`;
    pgn += `[Result "${result || '*'}"]\n`;
    if (resultReason) {
        pgn += `[Termination "${TERMINATION_BY_REASON[resultReason]}"]\n`;
    }
    pgn += `[PlyCount "${history.length}"]\n`;
    pgn += `[Variant "Standard"]\n`;
    pgn += `\n`;

    // Moves. They are collected as tokens (a `{ … }` comment is one token) so
    // wrapping can only break the text between tokens, never inside a comment
    // or a `[%eval …]` command.
    const tokens: string[] = [];
    let moveNumber = 1;
    let lastWasComment = false;

    history.forEach((move, index) => {
        if (index % 2 === 0) {
            tokens.push(`${moveNumber}.`, move.san);
            moveNumber++;
        } else if (lastWasComment) {
            // A comment breaks the move text, so Black's move needs its number.
            tokens.push(`${moveNumber - 1}...`, move.san);
        } else {
            tokens.push(move.san);
        }

        // Annotations
        const nag = getNAG(move);
        if (nag) tokens.push(nag);

        // Comments (Eval + Explanation)
        const comments = [];
        if (move.evaluation) {
            const evalText = move.evaluation.mate != null
                ? `#${move.evaluation.mate}`
                : (move.evaluation.evaluation / 100).toFixed(2);
            comments.push(`[%eval ${evalText}]`);
        }
        if (move.explanation) {
            // Clean explanation of newlines/curlies
            comments.push(move.explanation.replace(/[\{\}]/g, ''));
        }

        lastWasComment = comments.length > 0;
        if (lastWasComment) {
            tokens.push(`{ ${comments.join(' ')} }`);
        }
    });

    pgn += wrapTokens(tokens, 80);

    // Result suffix, always present (even `*` for unfinished games).
    pgn += ` ${result || '*'}`;

    return pgn;
}

/** Join tokens into lines of at most `width` characters, breaking between tokens. */
function wrapTokens(tokens: string[], width: number): string {
    const lines: string[] = [];
    let currentLine = '';

    tokens.forEach(token => {
        if (currentLine && currentLine.length + 1 + token.length > width) {
            lines.push(currentLine);
            currentLine = token;
            return;
        }
        currentLine = currentLine ? `${currentLine} ${token}` : token;
    });
    if (currentLine) lines.push(currentLine);

    return lines.join('\n');
}

// PGN section 9.8.1 fixes the Termination values. Every reason Chessy records
// ends the game by chess means, so all of them are "normal"; the descriptive
// reason stays in the UI. Exhaustive record: a new ResultReason must decide.
const TERMINATION_BY_REASON: Record<NonNullable<GameStore['resultReason']>, string> = {
    'checkmate': 'normal',
    'stalemate': 'normal',
    'threefold repetition': 'normal',
    'insufficient material': 'normal',
    '50-move rule': 'normal',
    'resignation': 'normal',
};

function getNAG(move: MoveHistory): string {
    if (!move.analysis) return '';
    switch (move.analysis.grade) {
        case 'brilliant': return '$3'; // !!
        case 'inaccuracy': return '$6'; // ?!
        case 'mistake': return '$2'; // ?
        case 'blunder': return '$4'; // ??
        default: return '';
    }
}
