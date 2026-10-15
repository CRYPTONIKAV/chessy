'use client';

import React from 'react';
import ChessBoard from '@/components/ChessBoard';
import { MoveHistory } from '@/store/types';

interface MistakeCardProps {
    move: MoveHistory;
    moveNumber: number;
}

export default function MistakeCard({ move, moveNumber }: MistakeCardProps) {
    if (!move.analysis || (move.analysis.grade !== 'mistake' && move.analysis.grade !== 'blunder')) {
        return null;
    }

    const isBlunder = move.analysis.grade === 'blunder';
    const borderColor = isBlunder ? 'border-red-500/50' : 'border-orange-500/50';
    const bgColor = isBlunder ? 'bg-red-500/10' : 'bg-orange-500/10';
    const badgeColor = isBlunder ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-orange-500/20 text-orange-400 border-orange-500/40';

    // Generate violated principle based on grade and tactical flags
    const getViolatedPrinciple = () => {
        if (move.tacticalFlags && move.tacticalFlags.length > 0) {
            const flag = move.tacticalFlags[0];
            const principles: Record<string, string> = {
                'hanging': 'Left piece undefended',
                'fork': 'Allowed a fork',
                'pin': 'Fell into a pin',
                'skewer': 'Allowed a skewer',
                'discovered_attack': 'Missed discovered attack',
                'back_rank': 'Weak back rank',
                'double_check': 'Allowed double check'
            };
            return principles[flag] || 'Tactical oversight';
        }

        if (isBlunder) {
            return 'Critical position mishandling';
        }
        return 'Inaccurate evaluation';
    };

    // Get best move from analysis
    const bestMove = move.analysis?.engineBestMove || 'Unknown';

    return (
        <div className={`${bgColor} ${borderColor} border-2 rounded-xl p-6 mb-4`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="text-sm text-gray-400 mb-1">Move {Math.floor(moveNumber / 2) + 1}{moveNumber % 2 === 0 ? '.' : '...'}</div>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColor}`}>
                        {move.analysis.grade}
                    </div>
                </div>
                {move.evaluation && (
                    <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase">Evaluation Loss</div>
                        <div className="text-xl font-mono font-bold text-red-400">
                            {move.analysis.evalDelta ? `${move.analysis.evalDelta > 0 ? '+' : ''}${(move.analysis.evalDelta / 100).toFixed(2)}` : 'N/A'}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Position */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Position Before Move</h4>
                    <div className="bg-black/20 rounded-lg p-2">
                        <ChessBoard
                            fen={move.fen}
                            disableAnimations={true}
                            boardOrientation="white"
                        />
                    </div>
                </div>

                {/* Right: Analysis */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Your Move</h4>
                        <div className="bg-white/5 rounded-lg p-3">
                            <span className="text-2xl font-bold text-red-400">{move.san}</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Better Alternative</h4>
                        <div className="bg-white/5 rounded-lg p-3">
                            <span className="text-2xl font-bold text-green-400">{bestMove}</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Violated Principle</h4>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <span className="text-yellow-300">{getViolatedPrinciple()}</span>
                        </div>
                    </div>

                    {move.explanation && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Consequence</h4>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                <p className="text-blue-200 text-sm italic">&ldquo;{move.explanation}&rdquo;</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
