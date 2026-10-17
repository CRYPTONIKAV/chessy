// Tests for the PGN export: round-trip through chess.js, line wrapping and the
// Termination header (see issue #147).
import { Chess } from 'chess.js';
import { generatePGN } from '../src/logic/export';
import type { EngineEvaluation } from '../src/engine/types';
import type { GameStore, MoveHistory, ResultReason } from '../src/store/types';

function createMove(san: string, extra: Partial<MoveHistory> = {}): MoveHistory {
    return { uci: '', san, fen: '', evaluation: null, ...extra };
}

function createEvaluation(evaluation: number, mate?: number): EngineEvaluation {
    return { bestMove: 'e2e4', evaluation, depth: 12, mate, lines: [] };
}

function createStore(
    history: MoveHistory[],
    options: { result?: string | null; resultReason?: ResultReason | null } = {},
): GameStore {
    return {
        history,
        result: options.result ?? null,
        resultReason: options.resultReason ?? null,
        orientation: 'white',
        difficulty: 'intermediate',
    } as unknown as GameStore;
}

const SCHOLARS_MATE = ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#'];
const ALL_REASONS: ResultReason[] = [
    'checkmate',
    'stalemate',
    'threefold repetition',
    'insufficient material',
    '50-move rule',
    'resignation',
];

function evaluationLines(pgn: string): string[] {
    return pgn.split('\n').filter((line) => line.includes('[%eval'));
}

describe('generatePGN', () => {
    test('a finished game round-trips through chess.js', () => {
        const pgn = generatePGN(
            createStore(SCHOLARS_MATE.map((san) => createMove(san)), {
                result: '1-0',
                resultReason: 'checkmate',
            }),
        );

        const game = new Chess();
        game.loadPgn(pgn);

        expect(game.history()).toHaveLength(SCHOLARS_MATE.length);
        expect(game.isCheckmate()).toBe(true);
        expect(game.getHeaders()['Result']).toBe('1-0');
        expect(game.getHeaders()['PlyCount']).toBe(String(SCHOLARS_MATE.length));
        expect(pgn.trim().endsWith('1-0')).toBe(true);
    });

    test('an unfinished game exports Result "*" and no Termination', () => {
        const pgn = generatePGN(createStore(['e4', 'e5'].map((san) => createMove(san))));

        expect(pgn).toContain('[Result "*"]');
        expect(pgn).not.toContain('[Termination');
        expect(pgn.trim().endsWith('*')).toBe(true);

        const game = new Chess();
        game.loadPgn(pgn);
        expect(game.history()).toHaveLength(2);
    });

    test('a resigned game round-trips with a standard Termination', () => {
        const pgn = generatePGN(
            createStore(['d4', 'd5'].map((san) => createMove(san)), {
                result: '0-1',
                resultReason: 'resignation',
            }),
        );

        expect(pgn).toContain('[Termination "normal"]');
        expect(pgn.trim().endsWith('0-1')).toBe(true);

        const game = new Chess();
        game.loadPgn(pgn);
        expect(game.getHeaders()['Termination']).toBe('normal');
    });

    test.each(ALL_REASONS)('every reason maps to the PGN standard Termination (%s)', (reason) => {
        const pgn = generatePGN(
            createStore(['e4', 'e5'].map((san) => createMove(san)), {
                result: '1/2-1/2',
                resultReason: reason,
            }),
        );

        expect(pgn).toContain('[Termination "normal"]');
    });

    test('mate evaluations keep their sign and are written on one line', () => {
        const pgn = generatePGN(
            createStore([
                createMove('e4', { evaluation: createEvaluation(0, 3) }),
                createMove('e5', { evaluation: createEvaluation(-15, -3) }),
            ]),
        );

        expect(pgn).toContain('{ [%eval #3] }');
        expect(pgn).toContain('{ [%eval #-3] }');
        expect(
            evaluationLines(pgn).every((line) => /\[%eval [^\]]+\]/.test(line)),
        ).toBe(true);
    });

    test('wrapping never splits a [%eval …] command and leaves no double space', () => {
        const history: MoveHistory[] = [];
        const moves = [
            'e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7',
            'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Na5', 'Bc2', 'c5',
            'd4', 'Qc7', 'Nbd2', 'Nc6', 'dxc5', 'dxc5', 'Nf1', 'Be6', 'Ng3', 'Rfd8',
        ];
        moves.forEach((san, index) => {
            history.push(
                createMove(san, {
                    evaluation: createEvaluation(index % 2 === 0 ? 20 : -20),
                    explanation: 'A longer explanation that gives the wrap something to work with.',
                }),
            );
        });

        const pgn = generatePGN(createStore(history, { result: '1/2-1/2', resultReason: 'threefold repetition' }));

        // Every line that carries an eval must carry the closing bracket too.
        const splitEvals = evaluationLines(pgn).filter(
            (line) => !/\[%eval [^\]]+\]/.test(line),
        );
        expect(splitEvals).toEqual([]);
        expect(pgn).not.toMatch(/ {2}/);

        const game = new Chess();
        game.loadPgn(pgn);
        expect(game.history()).toHaveLength(moves.length);
    });

    test('a comment before a Black move keeps a single space and the move number', () => {
        const pgn = generatePGN(
            createStore([
                createMove('e4', { evaluation: createEvaluation(30) }),
                createMove('e5'),
            ]),
        );

        expect(pgn).toContain('} 1... e5');
        expect(pgn).not.toMatch(/ {2}/);
    });
});
