import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { engineService } from '../engine/evaluateMove';
import { LEVELS } from '../store/types';
import { analyzeMoveResult } from '../logic/classifyMove';
import { detectTactics } from '../logic/tactics';
import { Square } from 'chess.js';

export function useChessEngine() {
    const {
        game,
        fen,
        turn,
        gameMode,
        difficulty,
        orientation,
        isGameOver,
        makeMove,
        setAnalysis,
        setAnalyzing,
        isAnalyzing,
        lastEvaluation,
        history,
        addMistake,
        setLastMoveAnalysis,
        setMoveEvaluation
    } = useGameStore();

    // Track if a computer move is pending to prevent duplicates
    const computerMovePending = useRef(false);

    // Effect to update engine options when difficulty changes
    useEffect(() => {
        if (!engineService) return;
        let config = LEVELS[difficulty];
        // Force strongest engine for silent and master
        if (difficulty === 'silent' || difficulty === 'master') {
            config = { ...config, skillLevel: 20, depth: 25, multiPV: 1 };
        }
        engineService.setOption('Skill Level', config.skillLevel);
    }, [difficulty]);

    // Main Engine Loop
    useEffect(() => {
        if (!engineService || isGameOver || isAnalyzing) return;

        console.log('[useChessEngine] Position changed:', { fen, turn, gameMode, orientation });

        const handleEngineWork = async () => {
            let config = LEVELS[difficulty];
            // Force strongest engine for silent and master
            if (difficulty === 'silent' || difficulty === 'master') {
                config = { ...config, skillLevel: 20, depth: 25, multiPV: 1 };
            }

            setAnalyzing(true);
            const evaluation = await engineService!.evaluate(fen, config.depth, config.multiPV);
            setAnalysis(evaluation);
            setAnalyzing(false);

            console.log('[useChessEngine] Evaluation complete:', {
                bestMove: evaluation.bestMove,
                shouldAutoPlay: gameMode === 'pve' && turn !== orientation.charAt(0),
                turn,
                orientation,
                computerMovePending: computerMovePending.current
            });

            // Analyze the move that just happened
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

                let explanation = undefined;
                try {
                    explanation = require('../logic/explanations').generateExplanation(
                        analysis.evalDelta,
                        analysis.tacticalFlags,
                        game,
                        {
                            from: lastMove.uci.slice(0, 2) as Square,
                            to: lastMove.uci.slice(2, 4) as Square,
                            piece: game.get(lastMove.uci.slice(0, 2) as Square)?.type || ''
                        }
                    ).summary;
                } catch { }

                setMoveEvaluation(
                    lastMoveIdx,
                    evaluation,
                    analysis,
                    tacticalFlags,
                    explanation
                );

                setLastMoveAnalysis(analysis);

                if (analysis.grade === 'mistake' || analysis.grade === 'blunder') {
                    addMistake({
                        fen: fen,
                        movePlayed: lastMove.uci,
                        betterMove: lastEvaluation.bestMove,
                        evalDiff: analysis.evalDelta
                    });
                }
            } else {
                setLastMoveAnalysis(null);
            }

            // 2. Make Computer Move if applicable
            if (gameMode === 'pve' && turn !== orientation.charAt(0) && !computerMovePending.current) {
                console.log('[useChessEngine] Computer should play now');
                // Play the move chosen under the level's Skill Level, not the
                // strongest line, so lower levels actually play weaker.
                const engineMove = evaluation.engineMove || evaluation.bestMove;
                if (engineMove && engineMove.length >= 4) {
                    const from = engineMove.substring(0, 2);
                    const to = engineMove.substring(2, 4);
                    const promotion = engineMove.substring(4, 5) || 'q';

                    computerMovePending.current = true;
                    console.log('[useChessEngine] Making computer move:', { from, to, promotion });

                    setTimeout(() => {
                        makeMove(from, to, promotion);
                        computerMovePending.current = false;
                    }, 500);
                }
            }
        };

        const timer = setTimeout(() => {
            handleEngineWork();
        }, 200);

        return () => clearTimeout(timer);
    }, [
        fen,
        turn,
        gameMode,
        difficulty,
        orientation,
        isGameOver,
        // NOTE: Removed 'game', 'isAnalyzing', and action functions from dependencies
        // to prevent infinite loops. Using fen and turn to track position changes.
    ]);
}
