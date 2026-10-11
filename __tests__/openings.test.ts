// Tests for opening detection
import { detectOpening, getOpeningInfo } from '../src/logic/openings';

describe('Opening Detection', () => {
    test('detects King\'s Pawn Opening', () => {
        const opening = detectOpening(['e4']);
        expect(opening).toBe("King's Pawn Opening");
    });

    test('detects King\'s Pawn Game', () => {
        const opening = detectOpening(['e4', 'e5']);
        expect(opening).toBe("King's Pawn Game");
    });

    test('detects Ruy Lopez', () => {
        const opening = detectOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
        expect(opening).toBe('Ruy Lopez');
    });

    test('detects Italian Game', () => {
        const opening = detectOpening(['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']);
        expect(opening).toBe('Italian Game');
    });

    test('detects Sicilian Defense', () => {
        const opening = detectOpening(['e4', 'c5']);
        expect(opening).toBe('Sicilian Defense');
    });

    test('detects French Defense', () => {
        const opening = detectOpening(['e4', 'e6']);
        expect(opening).toBe('French Defense');
    });

    test('detects Queen\'s Gambit', () => {
        const opening = detectOpening(['d4', 'd5', 'c4']);
        expect(opening).toBe("Queen's Gambit");
    });

    test('detects Queen\'s Gambit Accepted', () => {
        const opening = detectOpening(['d4', 'd5', 'c4', 'dxc4']);
        expect(opening).toBe("Queen's Gambit Accepted");
    });

    test('detects English Opening', () => {
        const opening = detectOpening(['c4']);
        expect(opening).toBe('English Opening');
    });

    test('detects Réti Opening', () => {
        const opening = detectOpening(['Nf3']);
        expect(opening).toBe('Réti Opening');
    });

    test('returns null for non-standard opening', () => {
        const opening = detectOpening(['a3', 'a6', 'h3', 'h6']);
        expect(opening).toBeNull();
    });

    test('returns null for empty history', () => {
        const opening = detectOpening([]);
        expect(opening).toBeNull();
    });

    test('finds longest matching opening', () => {
        // e4 matches "King's Pawn Opening" (1 move)
        // e4 e5 matches "King's Pawn Game" (2 moves)
        // Should return the longer match
        const opening1 = detectOpening(['e4']);
        const opening2 = detectOpening(['e4', 'e5']);
        expect(opening1).toBe("King's Pawn Opening");
        expect(opening2).toBe("King's Pawn Game");
    });

    test('getOpeningInfo returns opening object', () => {
        const info = getOpeningInfo(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
        expect(info).not.toBeNull();
        expect(info?.name).toBe('Ruy Lopez');
        expect(info?.moves).toEqual(['e4', 'e5', 'Nf3', 'Nc6', 'Bb5']);
    });

    test('handles partial matches correctly', () => {
        // e4 e5 Nf3 Nc6 should match "King's Pawn Game" not Ruy Lopez (which needs Bb5)
        const opening = detectOpening(['e4', 'e5', 'Nf3', 'Nc6']);
        expect(opening).toBe("King's Pawn Game");
    });
});
