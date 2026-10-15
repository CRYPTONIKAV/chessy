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
        pgn += `[Termination "${terminationText(resultReason, result)}"]\n`;
    }
    pgn += `[PlyCount "${history.length}"]\n`;
    pgn += `[Variant "Standard"]\n`;
    pgn += `\n`;

    // Moves
    let moveText = '';
    let moveNumber = 1;
    let lastWasComment = false;

    history.forEach((move, index) => {
        if (index % 2 === 0) {
            moveText += `${moveNumber}. ${move.san}`;
            moveNumber++;
        } else if (lastWasComment) {
            moveText += ` ${moveNumber - 1}... ${move.san}`;
        } else {
            moveText += ` ${move.san}`;
        }

        // Annotations
        const nag = getNAG(move);
        if (nag) moveText += ` ${nag}`;

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
            moveText += ` { ${comments.join(' ')} }`;
        }

        moveText += ' ';
    });

    // Formatting: break lines every 80 chars approximately
    const words = moveText.split(' ');
    let currentLine = '';

    words.forEach(word => {
        if (currentLine.length + word.length > 80) {
            pgn += currentLine.trim() + '\n';
            currentLine = '';
        }
        currentLine += word + ' ';
    });
    if (currentLine) pgn += currentLine.trim();

    // Result suffix, always present (even `*` for unfinished games).
    pgn += ` ${result || '*'}`;

    return pgn;
}

function terminationText(reason: NonNullable<GameStore['resultReason']>, result: string | null): string {
    const outcome = result === '1-0' ? 'White won' : result === '0-1' ? 'Black won' : 'Drawn';
    switch (reason) {
        case 'checkmate': return `${outcome} by checkmate`;
        case 'stalemate': return `${outcome} by stalemate`;
        case 'threefold repetition': return `${outcome} by threefold repetition`;
        case 'insufficient material': return `${outcome} by insufficient material`;
        case '50-move rule': return `${outcome} by fifty-move rule`;
        case 'resignation': return `${outcome} by resignation`;
        default: return outcome;
    }
}

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
