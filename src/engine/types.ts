export type AnalysisLine = {
    multipv: number;
    bestMove: string;
    evaluation: number; // centipawns, from White's point of view
    mate?: number; // moves to mate (positive = White mates)
    pv: string[]; // principal variation
};

export type EngineEvaluation = {
    bestMove: string; // strongest move found (first move of the main line)
    engineMove?: string; // move the engine chose to play, weakened by Skill Level
    evaluation: number; // centipawns, from White's point of view
    depth: number;
    mate?: number; // moves to mate (positive = White mates)
    ponder?: string;
    lines: AnalysisLine[];
};

export type TacticalFlag =
    | 'hanging'
    | 'fork'
    | 'pin'
    | 'skewer'
    | 'discovered_attack'
    | 'back_rank'
    | 'double_check';

export type MoveAnalysis = {
    playerMove: string;
    engineBestMove: string;
    evalBefore: number;
    evalAfter: number;
    evalDelta: number;
    grade: 'brilliant' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
    tacticalFlags: TacticalFlag[];
};

export type UCIResponse = {
    type: 'ready' | 'eval' | 'bestmove' | 'info';
    data: any;
};
