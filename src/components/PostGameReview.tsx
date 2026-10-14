import React, { useEffect, useRef } from "react";
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import ChessBoard from '@/components/ChessBoard';
import { generateJSON, generatePGN } from '@/logic/export';
import { describeResult } from '@/logic/result';

interface PostGameReviewProps {
  onClose: () => void;
  onNewGame: () => void;
}

const GRADE_COLORS: Record<string, string> = {
  brilliant: 'text-purple-300',
  good: 'text-emerald-300',
  inaccuracy: 'text-yellow-300',
  mistake: 'text-orange-300',
  blunder: 'text-red-400',
};

export default function PostGameReview({ onClose, onNewGame }: PostGameReviewProps) {
  const store = useGameStore();
  const { history, result, resultReason, orientation } = store;
  const [selectedMove, setSelectedMove] = React.useState<number>(-1);
  const move = selectedMove >= 0 ? history[selectedMove] : null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Start keyboard focus inside the dialog
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = generateJSON(store);
    downloadFile(json, `chessy_game_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const handleExportPGN = () => {
    const pgn = generatePGN(store);
    downloadFile(pgn, `chessy_game_${new Date().toISOString().split('T')[0]}.pgn`, 'text/plain');
  };

  const secondaryButton = 'px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-200 transition-colors';
  const primaryButton = 'px-3 py-2 rounded-md bg-white/15 hover:bg-white/25 border border-white/20 text-sm font-semibold text-white transition-colors';

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-game-title"
        className="bg-neutral-900 text-gray-100 border border-white/10 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full text-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          ×
        </button>

        <div className="mb-4 pr-10">
          <h2 id="post-game-title" className="text-xl font-bold">Post-Game Review</h2>
          {result && (
            <p className="text-sm text-gray-400 mt-1">
              {describeResult(result, resultReason, orientation)} · <span className="font-mono">{result}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:flex-1 min-w-0">
            <ChessBoard
              fen={move?.fen || history[history.length - 1]?.fen || ''}
              boardOrientation={orientation}
              disableAnimations
            />
            <div className="mt-4 flex flex-wrap gap-1">
              {history.map((m, i) => (
                <button
                  key={i}
                  className={`px-2 py-1 rounded text-sm font-mono transition-colors ${selectedMove === i ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10'} ${GRADE_COLORS[m.analysis?.grade ?? ''] ?? 'text-gray-300'}`}
                  onClick={() => setSelectedMove(i)}
                  aria-pressed={selectedMove === i}
                >
                  {i % 2 === 0 ? `${i / 2 + 1}. ` : ''}{m.san}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-72 text-sm">
            {move ? (
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400">Move:</span> <span className="font-semibold">{move.san}</span>
                </div>
                <div>
                  <span className="text-gray-400">Evaluation:</span>{' '}
                  {move.evaluation ? (move.evaluation.mate ? `M${Math.abs(move.evaluation.mate)}` : (move.evaluation.evaluation / 100).toFixed(2)) : 'N/A'}
                </div>
                {move.analysis && (
                  <div>
                    <span className="text-gray-400">Grade:</span>{' '}
                    <span className={`capitalize font-semibold ${GRADE_COLORS[move.analysis.grade] ?? ''}`}>{move.analysis.grade}</span>
                  </div>
                )}
                {move.tacticalFlags && move.tacticalFlags.length > 0 && (
                  <div>
                    <span className="text-gray-400">Tactics:</span> {move.tacticalFlags.join(', ')}
                  </div>
                )}
                {move.explanation && (
                  <div className="p-3 rounded-md bg-white/5 border border-white/10">
                    {move.explanation}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 italic text-center md:mt-10">Select a move to see details</div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2 justify-end">
          <button onClick={handleExportPGN} className={secondaryButton}>Export PGN</button>
          <button onClick={handleExportJSON} className={secondaryButton}>Export JSON</button>
          <Link href="/review" className={secondaryButton}>Full review</Link>
          <button onClick={onNewGame} className={primaryButton}>New game</button>
        </div>
      </div>
    </div>
  );
}
