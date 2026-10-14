'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGameStore, useStoreHydrated } from '@/store/gameStore';
import ChessBoard from '@/components/ChessBoard';
import GameSummary from '@/components/Review/GameSummary';
import MistakesTimeline from '@/components/Review/MistakesTimeline';
import AnalysisControls from '@/components/Review/AnalysisControls';
import MistakeCard from '@/components/MistakeCard';
import CategoryBadge from '@/components/Review/CategoryBadge';
import { groupMistakes, MistakeCategory, CategorizedMistake } from '@/logic/mistakeCategories';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import ShortcutsModal, { ShortcutDef } from '@/components/ShortcutsModal';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function ReviewPage() {
    // The review is read-only: it never changes the game itself
    const history = useGameStore((s) => s.history);
    const orientation = useGameStore((s) => s.orientation);
    const hydrated = useStoreHydrated();

    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

    // Move shown on the board: -1 is the starting position. This is local to
    // the review page; until the user navigates it follows the final move.
    const lastIndex = history.length - 1;
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const reviewIndex = Math.min(selectedIndex ?? lastIndex, lastIndex);
    const goTo = (index: number) => setSelectedIndex(Math.max(-1, Math.min(lastIndex, index)));

    useKeyboardShortcuts({
        onNextMove: () => goTo(reviewIndex + 1),
        onPrevMove: () => goTo(reviewIndex - 1),
        onFirstMove: () => goTo(-1),
        onLastMove: () => goTo(lastIndex),
        onShowShortcuts: () => setIsShortcutsOpen(true),
        onClose: () => setIsShortcutsOpen(false),
    });

    const reviewShortcuts: ShortcutDef[] = [
        { label: "Next Move", keys: ['→'] },
        { label: "Previous Move", keys: ['←'] },
        { label: "Game Start", keys: ['↑'] },
        { label: "Game End", keys: ['↓'] },
        { label: "Close", keys: ['Esc'] },
    ];

    const currentMove = reviewIndex >= 0 ? history[reviewIndex] : null;
    const currentMoveIndex = reviewIndex;
    const groupedMistakes = groupMistakes(history);

    const currentFen = currentMove ? currentMove.fen : START_FEN;

    if (hydrated && history.length === 0) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white p-8 flex flex-col items-center justify-center gap-4 text-center">
                <h1 className="text-2xl font-bold">No game to review yet</h1>
                <p className="text-gray-400">Play a game first. Your last game is kept here, even after a refresh.</p>
                <Link href="/play" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
                    Play a game
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4 md:p-8 flex flex-col items-center">
            <ShortcutsModal open={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} shortcuts={reviewShortcuts} />

            <header className="w-full max-w-6xl flex justify-between items-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Game Analysis
                </h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsShortcutsOpen(true)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm text-gray-400 flex items-center gap-2"
                    >
                        <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded">?</span> Shortcuts
                    </button>
                    <Link href="/play" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
                        Back to Game
                    </Link>
                </div>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 h-full flex-grow">
                {/* Left Column: Board */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex-grow flex items-center justify-center">
                        <ChessBoard
                            fen={currentFen}
                            disableAnimations={false}
                            boardOrientation={orientation}
                            arrows={[]}
                        />
                    </div>
                    <AnalysisControls index={reviewIndex} lastIndex={lastIndex} onChange={goTo} />
                    <MistakesTimeline history={history} index={reviewIndex} onChange={goTo} />
                </div>

                {/* Right Column: Analysis & Summary */}
                <div className="flex flex-col gap-6">
                    <GameSummary />

                    <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex-grow overflow-y-auto min-h-[300px]">
                        <h3 className="text-xl font-bold mb-4 text-gray-200">Move Analysis</h3>
                        {currentMove ? (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl font-mono font-bold">{Math.floor(currentMoveIndex / 2) + 1}.{currentMoveIndex % 2 === 0 ? '' : '..'}</span>
                                    <span className="text-3xl font-bold text-yellow-400">{currentMove.san}</span>
                                </div>

                                {currentMove.analysis && (
                                    <div className={`
                                inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 uppercase tracking-wider
                                ${currentMove.analysis.grade === 'blunder' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                                            currentMove.analysis.grade === 'mistake' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                                                currentMove.analysis.grade === 'brilliant' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' :
                                                    'bg-gray-500/20 text-gray-400'}
                            `}>
                                        {currentMove.analysis.grade}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {currentMove.evaluation && (
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Evaluation</div>
                                            <div className="text-xl font-mono">
                                                {currentMove.evaluation.mate
                                                    ? `M${currentMove.evaluation.mate}`
                                                    : (currentMove.evaluation.evaluation > 0 ? '+' : '') + (currentMove.evaluation.evaluation / 100).toFixed(2)}
                                            </div>
                                        </div>
                                    )}

                                    {currentMove.explanation && (
                                        <div className="bg-blue-500/10 p-4 rounded-lg border-l-4 border-blue-500">
                                            <p className="text-blue-100 italic">"{currentMove.explanation}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 italic flex items-center justify-center h-40">
                                Start of game
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mistakes Section - Grouped by Category */}
            <div className="w-full max-w-6xl mt-8">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Mistake Analysis by Category
                </h2>
                {history.filter(m => m.analysis?.grade === 'mistake' || m.analysis?.grade === 'blunder').length > 0 ? (
                    <div className="space-y-8">
                        {Object.entries(groupedMistakes).map(([category, mistakes]) => {
                            if (mistakes.length === 0) return null;
                            const categoryKey = category as MistakeCategory;

                            return (
                                <div key={category} className="space-y-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <CategoryBadge category={categoryKey} count={mistakes.length} />
                                        <div className="flex-1 h-px bg-white/10"></div>
                                    </div>
                                    <div className="space-y-4">
                                        {(mistakes as CategorizedMistake[]).map((mistake, idx) => (
                                            <MistakeCard
                                                key={`${category}-${idx}`}
                                                move={mistake.move}
                                                moveNumber={mistake.moveNumber}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white/5 rounded-xl p-8 text-center text-gray-500">
                        No mistakes or blunders detected. Great job!
                    </div>
                )}
            </div>

            <div className="w-full max-w-6xl mt-8 flex justify-center pb-8">
                <button
                    onClick={() => setIsShortcutsOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-full transition-all text-sm font-medium text-gray-400 hover:text-white"
                >
                    <span className="bg-white/10 w-5 h-5 flex items-center justify-center rounded text-xs">?</span>
                    Show Keyboard Shortcuts
                </button>
            </div>
        </div>
    );
}
