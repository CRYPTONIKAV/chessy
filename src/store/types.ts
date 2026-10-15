import { Chess } from 'chess.js';
import { EngineEvaluation, MoveAnalysis, TacticalFlag } from '../engine/types';

export type ResultReason =
    | 'checkmate'
    | 'stalemate'
    | 'threefold repetition'
    | 'insufficient material'
    | '50-move rule'
    | 'resignation';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'master' | 'silent';

export interface LevelConfig {
    depth: number; // maximum search depth
    moveTimeMs: number; // hard cap on thinking time per search, whichever limit is hit first
    multiPV: number;
    skillLevel: number; // Stockfish Skill Level (0-20)
    allowUndo: boolean; // New
    name: string;
    description: string;
}

export const LEVELS: Record<DifficultyLevel, LevelConfig> = {
    beginner: {
        depth: 5,
        moveTimeMs: 1000,
        multiPV: 1,
        skillLevel: 5,
        allowUndo: true,
        name: 'Beginner',
        description: 'Makes frequent mistakes. Good for learning basics.',
    },
    intermediate: {
        depth: 10,
        moveTimeMs: 1500,
        multiPV: 1,
        skillLevel: 10,
        allowUndo: true,
        name: 'Intermediate',
        description: 'Solid play but misses tactical opportunities.',
    },
    advanced: {
        depth: 15,
        moveTimeMs: 2500,
        multiPV: 3,
        skillLevel: 15,
        allowUndo: false,
        name: 'Advanced',
        description: 'Strong tactical play. Hard to beat.',
    },
    master: {
        depth: 25,
        moveTimeMs: 3000,
        multiPV: 1,
        skillLevel: 20,
        allowUndo: false,
        name: 'Master',
        description: 'Near perfect play. Maximum challenge.',
    },
    silent: {
        depth: 25,
        moveTimeMs: 3000,
        multiPV: 1,
        skillLevel: 20,
        allowUndo: false,
        name: 'Silent',
        description: 'Tournament mode: no feedback, no undo, strongest engine, post-game review only.',
    }
};

export interface MoveHistory {
    uci: string;
    san: string;
    fen: string;
    evaluation: EngineEvaluation | null;
    analysis?: MoveAnalysis | null;
    tacticalFlags?: TacticalFlag[];
    explanation?: string;
}

export interface GameState {
    // Core Board State
    game: Chess; // We might store just FEN and reconstruction commands to keep store serializable, but Chess instance is convenient
    fen: string;
    turn: 'w' | 'b';
    isGameOver: boolean;
    result: string | null; // "1-0", "0-1", "1/2-1/2" or null
    resultReason: ResultReason | null; // How the game ended
    history: MoveHistory[];

    // Engine & Analysis
    evaluation: EngineEvaluation | null;
    lastEvaluation: EngineEvaluation | null; // Eval before the last move
    isAnalyzing: boolean;
    lastMoveAnalysis: MoveAnalysis | null;

    // Configuration
    difficulty: DifficultyLevel;
    orientation: 'white' | 'black';
    gameMode: 'analysis' | 'pve' | 'pvp'; // new
    autoQueen: boolean;
    showLegalMoves: boolean;
    showEvalBar: boolean;

    // Puzzle / Mistake Tracking
    mistakes: {
        fen: string;
        movePlayed: string;
        betterMove: string;
        evalDiff: number;
    }[];
    // Move navigation (replay)
    currentMoveIndex: number; // -1 means live/latest
    currentOpening: string | null; // Current detected opening

    // Redo stack for redo functionality
    redoStack: MoveHistory[];
}

export interface GameActions {
    // Moves
    makeMove: (source: string, target: string, promotion?: string) => boolean;
    undoMove: () => void;
    redoMove: () => void;
    resetGame: () => void;
    resign: () => void; // The player resigns the current game

    // Settings
    setDifficulty: (level: DifficultyLevel) => void;
    setGameMode: (mode: 'analysis' | 'pve' | 'pvp') => void;
    setOrientation: (orientation: 'white' | 'black') => void;
    toggleOption: (option: keyof Pick<GameState, 'autoQueen' | 'showLegalMoves' | 'showEvalBar'>) => void;

    // Engine
    setAnalysis: (evaluation: EngineEvaluation) => void;
    setAnalyzing: (isAnalyzing: boolean) => void;
    addMistake: (mistake: GameState['mistakes'][0]) => void;
    setLastMoveAnalysis: (analysis: MoveAnalysis | null) => void;
    /**
     * Set the current move index for navigation/replay.
     * @param index The move index to navigate to (-1 for latest)
     */
    setCurrentMoveIndex: (index: number) => void;

    /**
     * Set the evaluation for a move in the history by index.
     * @param moveIndex Index of the move in history
     * @param evaluation EngineEvaluation to set
     */
    setMoveEvaluation: (
        moveIndex: number,
        evaluation: EngineEvaluation,
        analysis?: MoveAnalysis | null,
        tacticalFlags?: TacticalFlag[] | null,
        explanation?: string | null
    ) => void;
    setCurrentOpening: (opening: string | null) => void;
}

// Combined Store Type
export type GameStore = GameState & GameActions;
