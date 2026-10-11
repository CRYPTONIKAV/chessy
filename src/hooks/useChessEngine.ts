import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { engineService } from '../engine/evaluateMove';
import { LEVELS } from '../store/types';
import { analyzeMoveResult } from '../logic/classifyMove';
import { detectTactics } from '../logic/tactics';
import { generateExplanation } from '../logic/explanations';
import { Square } from 'chess.js';

// Short pause before analysing, so rapid position changes don't each start a search
const ANALYSIS_DEBOUNCE_MS = 200;
// Pause before the computer plays, so its reply doesn't feel instant
const COMPUTER_MOVE_DELAY_MS = 500;

export function useChessEngine() {
    const fen = useGameStore((s) => s.fen);
    const turn = useGameStore((s) => s.turn);
    const gameMode = useGameStore((s) => s.gameMode);
    const difficulty = useGameStore((s) => s.difficulty);
    const orientation = useGameStore((s) => s.orientation);
    const isGameOver = useGameStore((s) => s.isGameOver);

    // Effect to update engine options when difficulty changes
    useEffect(() => {
        if (!engineService) return;
        engineService.setOption('Skill Level', LEVELS[difficulty].skillLevel);
    }, [difficulty]);

    // Main Engine Loop: runs once per position. Every run owns its own search,
    // and a run whose position is no longer current is discarded, so a new
    // position always gets analysed (and answered) even if an older search
    // was still in progress.
    useEffect(() => {
        const engine = engineService;
        if (!engine) return;

        const { setAnalyzing } = useGameStore.getState();
        if (isGameOver) {
            engine.stop();
            setAnalyzing(false);
            return;
        }

        let cancelled = false;
        let computerMoveTimer: ReturnType<typeof setTimeout> | undefined;

        const handleEngineWork = async () => {
            const config = LEVELS[difficulty];

            setAnalyzing(true);
            const evaluation = await engine.evaluate(fen, config.depth, config.multiPV, config.moveTimeMs);

            // Superseded by a newer search, or the position changed meanwhile
            const state = useGameStore.getState();
            if (cancelled || !evaluation || state.fen !== fen) return;

            state.setAnalysis(evaluation);
            state.setAnalyzing(false);

            // Analyze the move that just happened
            const { lastEvaluation, history, game } = state;
            if (lastEvaluation && history.length > 0) {
                const lastMoveIdx = history.length - 1;
                const lastMove = history[lastMoveIdx];
                const moveColor = turn === 'w' ? 'b' : 'w';

                const tacticalFlags = detectTactics(game, lastMove.san);

                const analysis = analyzeMoveResult(
                    lastMove.uci,
                    lastEvaluation.bestMove,
                    lastEvaluation.evaluation,
                    evaluation.evaluation,
                    moveColor,
                    tacticalFlags
                );

                let explanation: string | undefined = undefined;
                try {
                    explanation = generateExplanation(
                        analysis.evalDelta,
                        analysis.tacticalFlags,
                        game,
                        {
                            from: lastMove.uci.slice(0, 2) as Square,
                            to: lastMove.uci.slice(2, 4) as Square,
                            piece: game.get(lastMove.uci.slice(0, 2) as Square)?.type || ''
                        }
                    ).summary;
                } catch (e) {
                    console.error('Error generating explanation:', e);
                }

                state.setMoveEvaluation(
                    lastMoveIdx,
                    evaluation,
                    analysis,
                    tacticalFlags,
                    explanation
                );

                state.setLastMoveAnalysis(analysis);

                if (analysis.grade === 'mistake' || analysis.grade === 'blunder') {
                    state.addMistake({
                        fen: fen,
                        movePlayed: lastMove.uci,
                        betterMove: lastEvaluation.bestMove,
                        evalDiff: analysis.evalDelta
                    });
                }
            } else {
                state.setLastMoveAnalysis(null);
            }

            // Make Computer Move if applicable
            if (gameMode === 'pve' && turn !== orientation.charAt(0)) {
                // Play the move chosen under the level's Skill Level, not the
                // strongest line, so lower levels actually play weaker.
                const engineMove = evaluation.engineMove || evaluation.bestMove;
                if (engineMove && engineMove.length >= 4) {
                    const from = engineMove.substring(0, 2);
                    const to = engineMove.substring(2, 4);
                    const promotion = engineMove.substring(4, 5) || 'q';

                    computerMoveTimer = setTimeout(() => {
                        // Only play if the position is still the one we searched
                        if (useGameStore.getState().fen === fen) {
                            useGameStore.getState().makeMove(from, to, promotion);
                        }
                    }, COMPUTER_MOVE_DELAY_MS);
                }
            }
        };

        const timer = setTimeout(() => {
            handleEngineWork();
        }, ANALYSIS_DEBOUNCE_MS);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            clearTimeout(computerMoveTimer);
        };
    }, [fen, turn, gameMode, difficulty, orientation, isGameOver]);
}
