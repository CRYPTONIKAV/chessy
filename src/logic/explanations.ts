import { Chess } from 'chess.js';
import { PRINCIPLES, Principle, PrincipleCategory } from './principles';
import { TacticalFlag } from '../engine/types';

export interface ExplanationContext {
    evalDelta: number;
    tactics: TacticalFlag[];
    position: Chess;
    move: { from: string; to: string; piece: string };
    phase: PrincipleCategory;
}

export interface Explanation {
    summary: string;
    details: string[];
    principles: Principle[];
    tactics: TacticalFlag[];
    evalDelta: number;
    phase: PrincipleCategory;
}

function getGamePhase(game: Chess): PrincipleCategory {
    const moveNum = game.moveNumber();
    if (moveNum <= 12) return 'opening';
    if (moveNum <= 35) return 'middlegame';
    return 'endgame';
}

function matchPrinciples(game: Chess, move: { from: string; to: string; piece: string }, phase: PrincipleCategory): Principle[] {
    // Simple matching: filter principles by phase
    return PRINCIPLES.filter(p => p.category === phase);
}

function matchTacticalPrinciples(tactics: TacticalFlag[]): Principle[] {
    // Map tactics to tactical principles
    return PRINCIPLES.filter(p => p.category === 'tactical' && tactics.includes(p.id as TacticalFlag));
}

function templateExplanation(context: ExplanationContext): Explanation {
    const { evalDelta, tactics, position, move, phase } = context;
    const principleMatches = matchPrinciples(position, move, phase);
    const tacticalMatches = matchTacticalPrinciples(tactics);
    const allPrinciples = [...principleMatches, ...tacticalMatches];

    let summary = '';
    let details: string[] = [];

    // Context-aware summary
    if (evalDelta < -100) {
        summary = 'This move significantly worsened your position.';
    } else if (evalDelta > 100) {
        summary = 'This move improved your position.';
    } else {
        summary = 'This move was solid.';
    }

    // Add principle explanations
    details = allPrinciples.map(p => p.explanation);

    // Add tactical explanations
    if (tactics.length > 0) {
        details.push('Tactical motifs detected: ' + tactics.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', '));
    }

    // Piece-specific context
    if (move.piece === 'q' && phase === 'opening') {
        details.push('Avoid moving your queen early in the opening.');
    }

    return {
        summary,
        details,
        principles: allPrinciples,
        tactics,
        evalDelta,
        phase
    };
}

export function generateExplanation(
    evalDelta: number,
    tactics: TacticalFlag[],
    position: Chess,
    move: { from: string; to: string; piece: string }
): Explanation {
    const phase = getGamePhase(position);
    const context: ExplanationContext = {
        evalDelta,
        tactics,
        position,
        move,
        phase
    };
    return templateExplanation(context);
}

// Example usage:
// const explanation = generateExplanation(-120, ['pin'], game, { from: 'e2', to: 'e4', piece: 'p' });
