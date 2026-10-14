import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { describeResult } from '@/logic/result';

export default function GameSummary() {
    const { result, resultReason, orientation, currentOpening, history, difficulty } = useGameStore();

    const resultText = describeResult(result, resultReason, orientation) ?? 'Game in progress';

    // Simple stats
    const mistakes = history.filter(m => m.analysis?.grade === 'mistake').length;
    const blunders = history.filter(m => m.analysis?.grade === 'blunder').length;

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl text-white">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                    {resultText}
                </h2>
                {result && <span className="font-mono text-sm text-gray-300 mt-2">{result}</span>}
            </div>
            <div className="text-lg text-gray-200 mb-4">
                {currentOpening || 'Unknown Opening'}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Difficulty</div>
                    <div className="font-medium capitalize">{difficulty}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Moves</div>
                    <div className="font-medium">{Math.ceil(history.length / 2)}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Mistakes</div>
                    <div className="font-medium text-orange-400">{mistakes}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Blunders</div>
                    <div className="font-medium text-red-500">{blunders}</div>
                </div>
            </div>
        </div>
    );
}
