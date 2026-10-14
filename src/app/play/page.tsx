'use client';
import React, { useState, useCallback, useMemo, useEffect, useRef, Suspense } from 'react';
import { createBestMoveArrow, Arrow } from '@/logic/arrows';
import { Chess, Square } from 'chess.js';
import { useGameStore, moverOf } from '../../store/gameStore';
import { useChessEngine } from '../../hooks/useChessEngine';
import { LEVELS, DifficultyLevel } from '../../store/types';
import { getTacticalDescription } from '@/logic/tactics';
import { detectOpening } from '@/logic/openings';
import { describeResult } from '@/logic/result';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import styles from './play.module.css';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import ShortcutsModal, { ShortcutDef } from '@/components/ShortcutsModal';

const ChessBoard = dynamic(() => import('../../components/ChessBoard'), { ssr: false });
const EvaluationBar = dynamic(() => import('../../components/EvaluationBar'), { ssr: false });
const FeedbackPanel = dynamic(() => import('../../components/FeedbackPanel'), { ssr: false });
const PostGameReview = dynamic(() => import('../../components/PostGameReview'), { ssr: false });
const MoveFeedbackOverlay = dynamic(() => import('../../components/MoveFeedbackOverlay'), { ssr: false });

function PlayContent() {
    const searchParams = useSearchParams();

    // Post-game review modal state
    const [showReview, setShowReview] = useState(false);

    // Global Game State
    const {
        game,
        fen,
        makeMove,
        undoMove,
        redoMove,
        resetGame,
        resign,
        resultReason,
        difficulty,
        setDifficulty,
        evaluation,
        history,
        result,
        lastMoveAnalysis,
        currentMoveIndex,
        setCurrentMoveIndex,
        redoStack,
        orientation,
        gameMode,
        setOrientation,
        currentOpening,
        setCurrentOpening
    } = useGameStore();

    // Initialize difficulty from URL
    useEffect(() => {
        const difficultyParam = searchParams.get('difficulty');
        if (difficultyParam && Object.keys(LEVELS).includes(difficultyParam)) {
            setDifficulty(difficultyParam as DifficultyLevel);
        }
    }, [searchParams, setDifficulty]);

    // Silent mode toggle (UI override)
    const [silentMode, setSilentMode] = useState(false);

    // Client-only rendering to avoid hydration errors
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Color selection UI state
    const [showColorSelection, setShowColorSelection] = useState(true);

    console.log('[PlayPage Render] currentOpening:', currentOpening);
    useEffect(() => {
        if (mounted) {
            setShowColorSelection(history.length === 0);
        }
    }, [history.length, mounted]);

    // Compute arrows: only show the best move suggested by the engine
    const arrows: Arrow[] = useMemo(() => {
        if (!mounted || silentMode || !evaluation || !evaluation.bestMove) return [];
        const bestMove = evaluation.bestMove;
        const from = bestMove.slice(0, 2);
        const to = bestMove.slice(2, 4);
        const bestMoveArrow = createBestMoveArrow(from, to, difficulty);
        return bestMoveArrow ? [bestMoveArrow] : [];
    }, [evaluation, difficulty, mounted, silentMode]);

    // Initialize Engine
    useChessEngine();

    // Local UI State for highlighting
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

    // The user may only move their own pieces, on their turn, on the live position
    const userColor = orientation === 'white' ? 'w' : 'b';
    const isViewingHistory = currentMoveIndex !== -1 && currentMoveIndex !== history.length - 1;
    const canUserMove = mounted && !result && !isViewingHistory &&
        (gameMode !== 'pve' || game.turn() === userColor);

    const onDrop = useCallback((sourceSquare: string, targetSquare: string) => {
        if (!canUserMove) return false;
        const success = makeMove(sourceSquare, targetSquare);
        if (success) setOptionSquares({});
        return success;
    }, [makeMove, canUserMove]);

    const onMouseOverSquare = (square: string) => {
        if (!canUserMove || game.get(square as Square)?.color !== game.turn()) return;
        const moves = game.moves({ square: square as Square, verbose: true });
        if (moves.length === 0) return;

        const newSquares: Record<string, React.CSSProperties> = {};
        moves.forEach(move => {
            const targetPiece = game.get(move.to as Square);
            const sourcePiece = game.get(square as Square);
            newSquares[move.to] = {
                background:
                    targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color
                        ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                borderRadius: '50%',
            };
        });
        newSquares[square] = { background: 'rgba(255, 255, 0, 0.4)' };
        setOptionSquares(newSquares);
    };

    const onMouseOutSquare = () => setOptionSquares({});

    const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDifficulty(e.target.value as DifficultyLevel);
    };

    const gameInProgress = history.length > 0 && !result;

    const handleReset = () => {
        if (gameInProgress && !window.confirm('Start a new game? The current game will be lost.')) return;
        resetGame();
        setShowReview(false);
        setOptionSquares({});
    };

    // Against the engine, undo needs a move of the player's to take back
    const canUndo = LEVELS[difficulty].allowUndo &&
        history.some(m => gameMode !== 'pve' || moverOf(m) === (orientation === 'white' ? 'w' : 'b'));
    const canRedo = redoStack.length > 0 && LEVELS[difficulty].allowUndo;
    const canGoBack = (currentMoveIndex ?? -1) > -1;
    const canGoForward = (currentMoveIndex ?? -1) < history.length - 1;

    // The FEN to display for the board (replay or live)
    const displayFen = currentMoveIndex !== -1 && history[currentMoveIndex]
        ? history[currentMoveIndex].fen
        : fen;



    // Post-game review modal trigger
    // Post-game review modal trigger
    useEffect(() => {
        if (result && !showReview) setShowReview(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result]);

    // Opening detection
    useEffect(() => {
        if (history.length > 0) {
            const moves = history.map(h => h.san);
            console.log('[Opening Detection] Moves:', moves);
            const opening = detectOpening(moves);
            console.log('[Opening Detection] Detected:', opening);
            setCurrentOpening(opening);
        } else {
            setCurrentOpening(null);
        }
    }, [history, setCurrentOpening]);

    // Hide color selection once game starts
    useEffect(() => {
        if (history.length > 0) {
            setShowColorSelection(false);
        }
    }, [history.length]);

    // Logic for delayed feedback (Advanced mode)
    // In advanced mode, we only show feedback for the user's PREVIOUS move, and only when it is the USER'S Turn (meaning opponent has replied).
    const delayedFeedbackMove = useMemo(() => {
        if (difficulty !== 'advanced') return null;
        // If it is my turn, it means opponent just moved. history[length-1] is opponent move. history[length-2] is MY last move.
        // We want to show feedback for MY last move.
        if (game && game.turn() === (orientation === 'white' ? 'w' : 'b') && history.length >= 2) {
            return history[history.length - 2];
        }
        return null;
    }, [difficulty, game, history, orientation]);

    // For non-advanced, we use the immediate last move. For advanced, we use the delayed one if available.
    // If it's advanced and NOT my turn (waiting for opponent), we show nothing (delayedFeedbackMove is null).
    const effectiveMoveAnalysis = difficulty === 'advanced'
        ? (delayedFeedbackMove ? delayedFeedbackMove.analysis : null)
        : lastMoveAnalysis;

    // Feedback for Beginner level
    let feedbackExplanation: string | undefined = undefined;
    let feedbackDetails: string[] = [];
    let feedbackTactics: string[] = [];

    if ((difficulty === 'beginner' || difficulty === 'intermediate') && effectiveMoveAnalysis && game) {
        let explanationObj: any = undefined;
        try {
            explanationObj = require('@/logic/explanations').generateExplanation(
                effectiveMoveAnalysis.evalDelta || 0,
                effectiveMoveAnalysis.tacticalFlags || [],
                game,
                {
                    from: effectiveMoveAnalysis.playerMove.slice(0, 2) as any,
                    to: effectiveMoveAnalysis.playerMove.slice(2, 4) as any,
                    piece: game.get(effectiveMoveAnalysis.playerMove.slice(0, 2) as any)?.type || ''
                }
            );
        } catch (e) { console.error("Error generating explanation:", e); }

        feedbackExplanation = explanationObj?.summary || (() => {
            switch (effectiveMoveAnalysis.grade) {
                case 'brilliant': return 'Excellent move! You found the best option.';
                case 'good': return 'Good move. You are playing solidly.';
                case 'inaccuracy': return 'This move is okay, but there was a better one.';
                case 'mistake': return 'This move could be improved. Try to spot tactics or threats.';
                case 'blunder': return 'Careful! This move loses material or allows a threat.';
                default: return 'Move played.';
            }
        })();
        feedbackDetails = explanationObj?.details || [];
        if (effectiveMoveAnalysis.evalDelta !== undefined) {
            feedbackDetails.unshift(`Evaluation change: ${(effectiveMoveAnalysis.evalDelta / 100).toFixed(2)} pawns.`);
        }
        if (effectiveMoveAnalysis.tacticalFlags?.length) {
            feedbackTactics = effectiveMoveAnalysis.tacticalFlags.map(getTacticalDescription);
        }
    }

    const showEvalBarSetting = useGameStore((state) => state.showEvalBar);
    const showEvalBar = (difficulty !== 'silent' && !silentMode) &&
        ((difficulty === 'intermediate' && showEvalBarSetting) || difficulty === 'beginner'); // Hidden for Advanced
    // Only Beginner gets the best move suggested (arrow and sidebar)
    const showBestMoveHint = difficulty === 'beginner' && !silentMode;

    // The on-board grade badge follows the same rules as the sidebar feedback:
    // Beginner/Intermediate see each grade immediately, Advanced only sees the
    // grade of their previous move once the engine has replied, and Master,
    // Silent and the Silent Mode toggle show nothing during play.
    const overlayAnalysis = silentMode ? null
        : (difficulty === 'beginner' || difficulty === 'intermediate') ? lastMoveAnalysis
        : difficulty === 'advanced' ? (effectiveMoveAnalysis ?? null)
        : null;


    // Keyboard Shortcuts Logic
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

    const handleNext = () => {
        if (canGoForward) setCurrentMoveIndex(Math.min(history.length - 1, (currentMoveIndex ?? -1) + 1));
    };
    const handlePrev = () => {
        if (canGoBack) setCurrentMoveIndex(Math.max(0, (currentMoveIndex ?? -1) - 1));
    };
    const handleFirst = () => setCurrentMoveIndex(0);
    const handleLast = () => setCurrentMoveIndex(-1);

    useKeyboardShortcuts({
        onUndo: canUndo ? undoMove : undefined,
        onRedo: canRedo ? redoMove : undefined,
        onNextMove: handleNext,
        onPrevMove: handlePrev,
        onFirstMove: handleFirst,
        onLastMove: handleLast,
        onShowShortcuts: () => setIsShortcutsOpen(true),
        onClose: () => setIsShortcutsOpen(false)
    });

    const playShortcuts: ShortcutDef[] = [
        { label: "Undo Move", keys: ['Ctrl', 'Z'] },
        { label: "Redo Move", keys: ['Ctrl', 'Y'] },
        { label: "Next Move", keys: ['→'] },
        { label: "Previous Move", keys: ['←'] },
        { label: "Game Start", keys: ['↑'] },
        { label: "Game Live", keys: ['↓'] },
        { label: "Shortcuts", keys: ['?'] },
        { label: "Close", keys: ['Esc'] },
    ];

    return (
        <>
            <ShortcutsModal open={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} shortcuts={playShortcuts} />
            {showReview && <PostGameReview onClose={() => setShowReview(false)} />}
            <div className="flex flex-col lg:flex-row h-screen w-full bg-background overflow-hidden relative">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />
                </div>

                {/* Main Board Area */}
                <main className="flex-1 flex items-center justify-center p-4 lg:p-8 relative z-10 transition-all duration-300">
                    <div className="flex items-center gap-6 w-full max-w-5xl justify-center h-full">
                        {/* Evaluation Bar */}
                        {showEvalBar && (
                            <div className="h-[min(80vh,80vw)] w-8 hidden md:block glass rounded-full overflow-hidden shadow-lg relative">
                                <EvaluationBar evaluation={evaluation?.evaluation || 0} mate={evaluation?.mate} />
                            </div>
                        )}

                        {/* Chess Board Container */}
                        <div className="w-full max-w-[min(80vh,100%)] glass p-2 rounded-lg shadow-2xl relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative">
                                <MoveFeedbackOverlay analysis={overlayAnalysis} />
                                <ChessBoard
                                    fen={displayFen}
                                    onPieceDrop={onDrop}
                                    customSquareStyles={optionSquares}
                                    onMouseOverSquare={onMouseOverSquare}
                                    onMouseOutSquare={onMouseOutSquare}
                                    arrows={arrows}
                                    boardOrientation={orientation}
                                    movableColor={canUserMove ? game.turn() : null}
                                />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className="flex flex-col w-full lg:w-96 h-[35vh] lg:h-full glass border-l border-white/5 p-6 z-20 shadow-xl transition-all duration-300 overflow-y-auto custom-scrollbar">
                    {/* Feedback Panel Logic 
                        - Beginner: Always show (if explanation exists), expanded.
                        - Intermediate: Always show, collapsed.
                        - Advanced: only show if effectiveMoveAnalysis exists (which is delayed), collapsed, NO text.
                    */}
                    {!silentMode && (
                        (difficulty === 'advanced' && effectiveMoveAnalysis) ||
                        ((difficulty === 'beginner' || difficulty === 'intermediate') && (feedbackExplanation || feedbackTactics.length > 0))
                    ) && (
                            <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <FeedbackPanel
                                    explanation={difficulty === 'advanced' ? undefined : feedbackExplanation}
                                    details={difficulty === 'advanced' ? [] : feedbackDetails}
                                    tactics={difficulty === 'advanced' ? [] : feedbackTactics}
                                    calm={difficulty === 'beginner'} // Only show calm quotes for beginner
                                    grade={effectiveMoveAnalysis?.grade}
                                    isCollapsible={difficulty === 'intermediate' || difficulty === 'advanced'}
                                    defaultExpanded={difficulty === 'beginner'}
                                />
                            </div>
                        )}

                    {/* Opening Name Display */}
                    {currentOpening && (
                        <div className="mb-4 p-3 glass rounded-xl border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="text-xs uppercase tracking-widest opacity-60 mb-1">Opening</div>
                            <div className="text-sm font-bold text-primary">{currentOpening}</div>
                        </div>
                    )}

                    <div className="flex-shrink-0 mb-6">
                        <h1 className="text-3xl font-bold font-sans mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">Chessy</h1>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                                <span className="text-sm font-medium text-text-secondary pl-2">Level</span>
                                <select
                                    value={difficulty}
                                    onChange={handleDifficultyChange}
                                    className="bg-black/20 text-foreground text-sm rounded px-3 py-1 border border-white/10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer hover:bg-black/30"
                                >
                                    {(Object.keys(LEVELS) as DifficultyLevel[]).map(level => (
                                        <option key={level} value={level} className="bg-gray-900">{LEVELS[level].name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Board Orientation Toggle */}
                            {mounted && showColorSelection && (
                                <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                                    <span className="text-sm font-medium text-text-secondary pl-2">Play as</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setOrientation('white')}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${orientation === 'white'
                                                ? 'bg-primary text-white'
                                                : 'bg-black/20 text-text-secondary hover:bg-black/30'
                                                }`}
                                        >
                                            White
                                        </button>
                                        <button
                                            onClick={() => setOrientation('black')}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${orientation === 'black'
                                                ? 'bg-primary text-white'
                                                : 'bg-black/20 text-text-secondary hover:bg-black/30'
                                                }`}
                                        >
                                            Black
                                        </button>
                                    </div>
                                </div>
                            )}

                            <label className="flex items-center justify-between text-sm text-text-secondary bg-white/5 p-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                <span className="pl-2">Silent Mode</span>
                                <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                                    <input
                                        type="checkbox"
                                        checked={silentMode}
                                        onChange={e => setSilentMode(e.target.checked)}
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-gray-900 appearance-none cursor-pointer"
                                        style={{ transform: silentMode ? 'translateX(100%)' : 'translateX(0)', backgroundColor: silentMode ? 'var(--primary)' : 'white' }}
                                    />
                                    <span className={`toggle - label block overflow - hidden h - 5 rounded - full bg - gray - 900 cursor - pointer border border - white / 10 transition - colors ${silentMode ? 'bg-primary/50' : 'bg-black/50'} `}></span>
                                </div>
                            </label>

                            {difficulty === 'intermediate' && (
                                <label className="flex items-center justify-between text-sm text-text-secondary bg-white/5 p-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <span className="pl-2">Show Eval Bar</span>
                                    <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                                        <input
                                            type="checkbox"
                                            checked={showEvalBarSetting}
                                            onChange={() => useGameStore.getState().toggleOption('showEvalBar')}
                                            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-gray-900 appearance-none cursor-pointer"
                                            style={{ transform: showEvalBarSetting ? 'translateX(100%)' : 'translateX(0)', backgroundColor: showEvalBarSetting ? 'var(--primary)' : 'white' }}
                                        />
                                        <span className={`toggle-label block overflow-hidden h-5 rounded-full bg-gray-900 cursor-pointer border border-white/10 transition-colors ${showEvalBarSetting ? 'bg-primary/50' : 'bg-black/50'}`}></span>
                                    </div>
                                </label>
                            )}
                        </div>
                        <div className="text-xs text-text-secondary mt-3 opacity-60 leading-relaxed px-1">{LEVELS[difficulty].description}</div>
                        {mounted && !result && game.turn() !== orientation.charAt(0) && (
                            <div className="mt-3 text-xs text-text-secondary animate-pulse px-1" role="status">Engine is thinking…</div>
                        )}
                        {result && (
                            <div className="mt-4 p-4 rounded-lg border border-white/10 bg-white/5 text-center" role="status">
                                <div className="font-bold text-lg text-white">{describeResult(result, resultReason, orientation)}</div>
                                <div className="text-xs font-mono text-text-secondary mt-1">{result}</div>
                                <button
                                    onClick={handleReset}
                                    className="mt-3 w-full py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm font-semibold text-white transition-colors"
                                >
                                    New game
                                </button>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    <div className="flex-shrink-0 bg-black/20 rounded-xl p-4 text-sm font-mono text-text-secondary border border-white/5 shadow-inner">
                        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                            <h3 className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Move History</h3>
                            <span className="text-[10px] opacity-40">{history.length / 2} Moves</span>
                        </div>

                        {history.length === 0 ? (
                            <div className="h-full flex items-center justify-center opacity-30 italic text-xs">Game started. White to move.</div>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                                    <div key={i} className="flex col-span-2 items-center gap-2 hover:bg-white/5 rounded px-2 py-1 transition-colors">
                                        <span className="w-6 text-[10px] text-gray-500 font-bold">{i + 1}.</span>
                                        <span
                                            className={`flex - 1 cursor - pointer transition - colors ${currentMoveIndex === i * 2 ? 'text-primary font-bold decoration-primary underline underline-offset-2' : 'text-foreground hover:text-white'} `}
                                            onClick={() => setCurrentMoveIndex(i * 2)}
                                        >
                                            {history[i * 2]?.san}
                                        </span>
                                        <span
                                            className={`flex - 1 cursor - pointer transition - colors ${currentMoveIndex === i * 2 + 1 ? 'text-primary font-bold decoration-primary underline underline-offset-2' : 'text-gray-400 hover:text-white'} `}
                                            onClick={() => setCurrentMoveIndex(i * 2 + 1)}
                                        >
                                            {history[i * 2 + 1]?.san || ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Analysis Info: only on levels that show the evaluation */}
                    {evaluation && showEvalBar && (
                        <div className="mt-4 p-4 bg-black/40 backdrop-blur-md rounded-xl text-xs font-mono border border-white/10 shadow-lg group hover:border-primary/30 transition-colors">
                            <div className="flex justify-between mb-2">
                                <span className="opacity-60">Evaluation</span>
                                <span className={`font - bold ${evaluation.evaluation >= 0 ? 'text-emerald-400' : 'text-rose-400'} `}>
                                    {evaluation.mate ? `M${Math.abs(evaluation.mate)} ` : (evaluation.evaluation / 100).toFixed(2)}
                                </span>
                            </div>
                            {showBestMoveHint && (
                                <div className="flex justify-between mb-2">
                                    <span className="opacity-60">Best Move</span>
                                    <span className="text-secondary font-bold">{evaluation.bestMove}</span>
                                </div>
                            )}
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, (evaluation.depth / 20) * 100))}% ` }}></div>
                            </div>
                            <div className="flex justify-between mt-1 text-[10px] opacity-40">
                                <span>Depth</span>
                                <span>{evaluation.depth}/20</span>
                            </div>
                        </div>
                    )}

                    {isViewingHistory && !result && (
                        <div className="mt-4 p-3 rounded-lg border border-white/10 bg-white/5 text-xs text-text-secondary">
                            Viewing an earlier position. Press <span className="font-bold text-foreground">»</span> to return to the live game and move.
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-2">
                        <button onClick={() => setCurrentMoveIndex(0)} disabled={history.length === 0 || currentMoveIndex === 0} className="nav-btn">&#171;</button>
                        <button onClick={() => setCurrentMoveIndex(Math.max(0, (currentMoveIndex ?? -1) - 1))} disabled={!canGoBack} className="nav-btn">&#8249;</button>
                        <button onClick={() => setCurrentMoveIndex(Math.min(history.length - 1, (currentMoveIndex ?? -1) + 1))} disabled={!canGoForward} className="nav-btn">&#8250;</button>
                        <button onClick={() => setCurrentMoveIndex(-1)} disabled={currentMoveIndex === -1} className="nav-btn">&#187;</button>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <button onClick={canUndo ? undoMove : undefined} disabled={!canUndo} className="nav-btn text-xs">Undo</button>
                        <button onClick={canRedo ? redoMove : undefined} disabled={!canRedo} className="nav-btn text-xs">Redo</button>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                            onClick={handleReset}
                            className="py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-foreground transition-colors"
                        >
                            New game
                        </button>
                        <button
                            onClick={() => { if (window.confirm('Resign this game?')) resign(); }}
                            disabled={!gameInProgress}
                            className="py-2 rounded-md bg-white/5 hover:bg-error/20 border border-white/10 text-xs text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                        >
                            Resign
                        </button>
                    </div>
                </aside>

                {/* Global Style for Nav Buttons (injected here for simplicity or could be in globas.css) */}
                <style jsx global>{`
    .nav - btn {
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border - radius: 6px;
    color: var(--foreground);
    transition: all 0.2s;
}
                    .nav - btn: hover: not(: disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}
                    .nav - btn:disabled {
    opacity: 0.3;
    cursor: not - allowed;
}
                    .custom - scrollbar:: -webkit - scrollbar {
    width: 4px;
}
                    .custom - scrollbar:: -webkit - scrollbar - track {
    background: rgba(0, 0, 0, 0.1);
}
                    .custom - scrollbar:: -webkit - scrollbar - thumb {
    background: rgba(255, 255, 255, 0.1);
    border - radius: 4px;
}
`}</style>
            </div>
        </>
    );
}

export default function PlayPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background text-text-secondary">Loading Engine...</div>}>
            <PlayContent />
        </Suspense>
    );
}
