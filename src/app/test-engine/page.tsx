'use client';

import { useState } from 'react';
import { engineService } from '@/engine/evaluateMove';
import { EngineEvaluation } from '@/engine/types';

export default function TestEnginePage() {
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [evalResult, setEvalResult] = useState<EngineEvaluation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [multiPV, setMultiPV] = useState(3);

    const testEval = async () => {
        if (!engineService) {
            setError('Engine service not available (client-side only)');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const startTime = performance.now();
            const result = await engineService.evaluate(fen, 15, multiPV);
            const endTime = performance.now();
            console.log(`Evaluation took ${endTime - startTime}ms`);
            setEvalResult(result);
        } catch (err) {
            setError('Failed to evaluate position');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold font-sans">Engine Diagnostic</h1>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">FEN Position</label>
                    <input
                        type="text"
                        value={fen}
                        onChange={(e) => setFen(e.target.value)}
                        className="w-full p-2 bg-bg-secondary border border-text-secondary rounded font-mono text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-text-secondary">MultiPV (Lines)</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={multiPV}
                        onChange={(e) => setMultiPV(parseInt(e.target.value))}
                        className="w-full p-2 bg-bg-secondary border border-text-secondary rounded font-mono text-sm"
                    />
                </div>
            </div>

            <button
                onClick={testEval}
                disabled={loading}
                className="px-4 py-2 bg-accent text-white rounded hover:opacity-90 disabled:opacity-50 transition-all font-sans"
            >
                {loading ? 'Evaluating...' : 'Run Evaluation (Depth 15)'}
            </button>

            {error && <div className="p-4 bg-error text-white rounded">{error}</div>}

            {evalResult && (
                <div className="space-y-4">
                    {evalResult.lines.map((line, index) => (
                        <div key={index} className="p-6 bg-bg-secondary rounded-lg space-y-4 border border-text-secondary">
                            <div className="flex justify-between items-center border-b border-text-secondary pb-2">
                                <h2 className="text-xl font-bold">Line #{line.multipv}</h2>
                                <span className="text-sm text-text-secondary font-mono">Depth: {evalResult.depth}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-text-secondary uppercase tracking-wider">Evaluation</p>
                                    <p className="text-2xl font-mono">{line.mate ? `Mate in ${line.mate}` : (line.evaluation / 100).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary uppercase tracking-wider">Best Move</p>
                                    <p className="text-2xl font-mono">{line.bestMove}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary uppercase tracking-wider mb-1">Variation</p>
                                <div className="flex flex-wrap gap-2">
                                    {line.pv.slice(0, 10).map((move, i) => (
                                        <span key={i} className="px-2 py-1 bg-background rounded text-xs font-mono">{move}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
