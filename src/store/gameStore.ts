import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Chess } from 'chess.js';
import { GameStore, LEVELS, DifficultyLevel, GameState, MoveHistory, ResultReason } from './types';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** Colour that played a move, read from the position after it */
export function moverOf(move: MoveHistory): 'w' | 'b' {
    return move.fen.split(' ')[1] === 'w' ? 'b' : 'w';
}

/** Rebuild a game from its move list; null if any move is not legal */
function replay(moves: MoveHistory[]): Chess | null {
    const game = new Chess();
    try {
        for (const m of moves) {
            game.move({ from: m.uci.slice(0, 2), to: m.uci.slice(2, 4), promotion: m.uci[4] });
        }
    } catch {
        return null;
    }
    return game;
}

function endReason(game: Chess): ResultReason | null {
    if (game.isCheckmate()) return 'checkmate';
    if (game.isStalemate()) return 'stalemate';
    if (game.isThreefoldRepetition()) return 'threefold repetition';
    if (game.isInsufficientMaterial()) return 'insufficient material';
    if (game.isDraw()) return '50-move rule';
    return null;
}

function positionState(game: Chess) {
    const isGameOver = game.isGameOver();
    return {
        game,
        fen: game.fen(),
        turn: game.turn(),
        isGameOver,
        result: isGameOver
            ? (game.isCheckmate() ? (game.turn() === 'w' ? '0-1' : '1-0') : '1/2-1/2')
            : null,
        resultReason: isGameOver ? endReason(game) : null,
    };
}

// Parts of the game saved in the browser, so a refresh (or opening the review
// page directly) doesn't lose the game. Everything else is derived on load.
type PersistedGame = Pick<GameStore,
    'history' | 'redoStack' | 'result' | 'resultReason' | 'difficulty' |
    'orientation' | 'showEvalBar' | 'mistakes' | 'currentOpening'>;

export const useGameStore = create<GameStore>()(persist((set, get) => ({
    // Initial State
    game: new Chess(),
    fen: INITIAL_FEN,
    turn: 'w',
    isGameOver: false,
    result: null,
    resultReason: null,
    history: [],

    evaluation: null,
    lastEvaluation: null,
    isAnalyzing: false,
    lastMoveAnalysis: null,

    difficulty: 'beginner',
    orientation: 'white',
    gameMode: 'pve', // Default to Player vs Engine
    autoQueen: true,
    showLegalMoves: true,
    showEvalBar: true,

    mistakes: [],
    currentMoveIndex: -1, // -1 means live/latest
    currentOpening: null, // Current detected opening
    redoStack: [],
    setCurrentMoveIndex: (index) => {
        set({ currentMoveIndex: index });
    },

    // Actions
    makeMove: (source: string, target: string, promotion: string = 'q') => {
        console.log('[gameStore.makeMove] Called with:', { source, target, promotion });
        const { game, evaluation, history } = get();
        console.log('[gameStore.makeMove] Current state:', {
            currentFen: game.fen(),
            turn: game.turn(),
            historyLength: history.length
        });

        if (get().result) return false; // e.g. after resigning

        // Rebuild from the full move list (not just the FEN) so chess.js can
        // detect threefold repetition
        const gameCopy = replay(history) ?? new Chess(game.fen());
        console.log('[gameStore.makeMove] Created game copy with FEN:', gameCopy.fen());

        try {
            const move = gameCopy.move({
                from: source,
                to: target,
                promotion: promotion,
            });
            console.log('[gameStore.makeMove] Move result:', move);

            if (move) {
                // Build new move history with richer data
                // Simply append the new move to existing history
                const newMoveEntry = {
                    uci: move.lan,
                    san: move.san,
                    fen: gameCopy.fen(), // Current position AFTER this move
                    evaluation: null, // Will be filled in later by engine analysis
                    analysis: null,
                    tacticalFlags: undefined,
                    explanation: undefined,
                };

                const prevHistory = [...history, newMoveEntry];

                const newState = {
                    ...positionState(gameCopy),
                    history: prevHistory,
                    redoStack: [], // A new move makes any undone moves invalid
                    lastEvaluation: evaluation, // Save prev eval
                    evaluation: null, // Clear current eval until re-analysis
                };

                console.log('[gameStore.makeMove] Setting new state:', {
                    newFen: newState.fen,
                    newTurn: newState.turn,
                    newHistoryLength: newState.history.length,
                    lastMove: newMoveEntry
                });

                set(newState);
                console.log('[gameStore.makeMove] State set successfully, returning true');
                return true;
            } else {
                console.log('[gameStore.makeMove] Move was null/undefined - invalid move');
            }
        } catch (e) {
            console.error('[gameStore.makeMove] Exception occurred:', e);
            return false;
        }
        console.log('[gameStore.makeMove] Returning false');
        return false;
    },

    undoMove: () => {
        const { history, redoStack, gameMode, orientation } = get();
        if (history.length === 0) return;

        // Against the engine, take back the player's last move together with
        // the engine's reply, so it is the player's turn again (otherwise the
        // engine would immediately play again).
        let cut = history.length - 1;
        if (gameMode === 'pve') {
            const playerColor = orientation === 'white' ? 'w' : 'b';
            while (cut >= 0 && moverOf(history[cut]) !== playerColor) cut--;
            if (cut < 0) return; // the player hasn't moved yet
        }

        const newHistory = history.slice(0, cut);
        const gameCopy = replay(newHistory);
        if (!gameCopy) return;
        set({
            ...positionState(gameCopy),
            history: newHistory,
            redoStack: [...history.slice(cut), ...redoStack],
            evaluation: null, // Clear eval on undo
            lastEvaluation: null,
            lastMoveAnalysis: null,
            currentMoveIndex: -1,
        });
    },

    redoMove: () => {
        const { history, redoStack, gameMode, orientation } = get();
        if (redoStack.length === 0) return;

        // Against the engine, restore the player's move together with the
        // engine's reply that followed it.
        let take = 1;
        if (gameMode === 'pve') {
            const playerColor = orientation === 'white' ? 'w' : 'b';
            while (take < redoStack.length && moverOf(redoStack[take]) !== playerColor) take++;
        }

        const newHistory = [...history, ...redoStack.slice(0, take)];
        const gameCopy = replay(newHistory);
        if (!gameCopy) {
            // The redo moves no longer fit this game; drop them
            set({ redoStack: [] });
            return;
        }
        set({
            ...positionState(gameCopy),
            history: newHistory,
            redoStack: redoStack.slice(take),
            evaluation: null, // Clear eval on redo
            lastEvaluation: null,
            lastMoveAnalysis: null,
            currentMoveIndex: -1,
        });
    },

    resetGame: () => {
        set({
            game: new Chess(),
            fen: INITIAL_FEN,
            turn: 'w',
            isGameOver: false,
            result: null,
            resultReason: null,
            history: [],
            redoStack: [],
            evaluation: null,
            lastEvaluation: null,
            lastMoveAnalysis: null,
            mistakes: [],
            currentMoveIndex: -1,
            currentOpening: null,
        });
    },

    resign: () => {
        const { result, orientation } = get();
        if (result) return;
        set({
            isGameOver: true,
            result: orientation === 'white' ? '0-1' : '1-0',
            resultReason: 'resignation',
            redoStack: [],
            currentMoveIndex: -1,
        });
    },

    setDifficulty: (level: DifficultyLevel) => {
        set({ difficulty: level });
    },

    setGameMode: (mode) => {
        set({ gameMode: mode });
    },

    setOrientation: (orientation: 'white' | 'black') => {
        set({ orientation });
    },

    toggleOption: (option) => {
        set((state) => ({ [option]: !state[option] }));
    },

    setAnalysis: (evaluation) => {
        set({ evaluation });
    },

    setAnalyzing: (isAnalyzing) => {
        set({ isAnalyzing });
    },

    addMistake: (mistake) => {
        set((state) => ({ mistakes: [...state.mistakes, mistake] }));
    },

    setLastMoveAnalysis: (analysis) => {
        set({ lastMoveAnalysis: analysis });
    },

    setCurrentOpening: (opening: string | null) => {
        set({ currentOpening: opening });
    },

    setMoveEvaluation: (moveIndex, evaluation, analysis = null, tacticalFlags = null, explanation = null) => {
        set((state) => {
            if (!state.history[moveIndex]) return {};
            const updatedHistory = state.history.map((move, idx) =>
                idx === moveIndex
                    ? { ...move, evaluation, analysis: analysis || move.analysis, tacticalFlags: tacticalFlags || move.tacticalFlags, explanation: explanation || move.explanation }
                    : move
            );
            return { history: updatedHistory };
        });
    }
}), {
    name: 'chessy-game',
    version: 1,
    storage: createJSONStorage(() => localStorage),
    // Hydrate on the client after mount (see StoreHydration) to avoid
    // server/client render mismatches
    skipHydration: true,
    partialize: (state): PersistedGame => ({
        history: state.history,
        redoStack: state.redoStack,
        result: state.result,
        resultReason: state.resultReason,
        difficulty: state.difficulty,
        orientation: state.orientation,
        showEvalBar: state.showEvalBar,
        mistakes: state.mistakes,
        currentOpening: state.currentOpening,
    }),
    merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedGame> | undefined;
        if (!saved) return current;
        const game = replay(saved.history ?? []);
        if (!game) return current; // corrupt save: start fresh
        const position = positionState(game);
        // A resignation isn't visible on the board, so keep the saved result
        const resigned = saved.resultReason === 'resignation' && !!saved.result;
        return {
            ...current,
            ...saved,
            ...position,
            ...(resigned ? { isGameOver: true, result: saved.result!, resultReason: 'resignation' as const } : {}),
            history: saved.history ?? [],
            redoStack: saved.redoStack ?? [],
            currentMoveIndex: -1,
        };
    },
}));

/** True once the saved game has been loaded from the browser */
export function useStoreHydrated(): boolean {
    return useSyncExternalStore(
        (onChange) => useGameStore.persist.onFinishHydration(onChange),
        () => useGameStore.persist.hasHydrated(),
        () => false
    );
}
