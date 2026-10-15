'use client';

import { Chessboard, PieceDropHandlerArgs } from 'react-chessboard';
import { useState, useEffect, useRef } from 'react';

import { Arrow } from '@/logic/arrows';

interface ChessBoardComponentProps {
    fen: string;
    onPieceDrop?: (sourceSquare: string, targetSquare: string) => boolean;
    boardOrientation?: 'white' | 'black';
    customSquareStyles?: Record<string, React.CSSProperties>;
    onMouseOverSquare?: (square: string) => void;
    onMouseOutSquare?: (square: string) => void;
    arrows?: Arrow[];
    disableAnimations?: boolean; // Accessibility: disables piece movement animation
    // Which side's pieces the user may pick up: 'w' or 'b', null for none.
    // Leave undefined to allow both (e.g. analysis boards).
    movableColor?: 'w' | 'b' | null;
}

export default function ChessBoard({
    fen,
    onPieceDrop,
    boardOrientation = 'white',
    customSquareStyles,
    onMouseOverSquare,
    onMouseOutSquare,
    arrows = [],
    disableAnimations = false,
    movableColor,
}: ChessBoardComponentProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [, setBoardSize] = useState(300);

    useEffect(() => {
        if (!wrapperRef.current) return;

        const updateSize = () => {
            if (wrapperRef.current) {
                const width = wrapperRef.current.offsetWidth;
                setBoardSize(width);
            }
        };

        updateSize();

        const resizeObserver = new ResizeObserver(() => {
            updateSize();
        });

        resizeObserver.observe(wrapperRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Wrap the onPieceDrop to match the library's expected signature
    const handlePieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
        if (!targetSquare || !onPieceDrop) return false;
        return onPieceDrop(sourceSquare, targetSquare);
    };

    // Custom styles for a premium, minimalist look
    const darkSquareStyle = { backgroundColor: '#779952' };
    const lightSquareStyle = { backgroundColor: '#edeed1' };

    // Click-to-move state
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const [clickStyles, setClickStyles] = useState<Record<string, React.CSSProperties>>({});

    // pieceType looks like "wP" / "bN"; the first letter is the colour
    const isMovablePiece = (pieceType: string | undefined) =>
        !!pieceType && movableColor !== null && (movableColor === undefined || pieceType[0] === movableColor);

    const selectSquare = (square: string) => {
        setSelectedSquare(square);
        setClickStyles({
            [square]: {
                boxShadow: '0 0 0 3px #ffd700',
                background: 'rgba(255,255,0,0.2)',
            },
        });
    };

    // Clear any selection once moving is no longer allowed (e.g. engine's turn)
    const [prevMovableColor, setPrevMovableColor] = useState(movableColor);
    if (prevMovableColor !== movableColor) {
        setPrevMovableColor(movableColor);
        setSelectedSquare(null);
        setClickStyles({});
    }

    // Handle square click
    const handleSquareClick = (square: string, pieceType?: string) => {
        if (!selectedSquare) {
            // Only pieces the user is allowed to move can be selected
            if (isMovablePiece(pieceType)) selectSquare(square);
        } else if (selectedSquare === square) {
            setSelectedSquare(null);
            setClickStyles({});
        } else {
            // Try to make move
            if (onPieceDrop && onPieceDrop(selectedSquare, square)) {
                setSelectedSquare(null);
                setClickStyles({});
            } else if (isMovablePiece(pieceType)) {
                // Clicking another of your own pieces switches the selection
                selectSquare(square);
            } else {
                // Invalid move, keep selection
                setClickStyles({
                    [selectedSquare]: {
                        boxShadow: '0 0 0 3px #ff1744',
                        background: 'rgba(255,0,0,0.1)',
                    },
                });
            }
        }
    };

    // Merge customSquareStyles and clickStyles
    const mergedSquareStyles = { ...customSquareStyles, ...clickStyles };

    return (
        <div
            ref={wrapperRef}
            className="w-full max-w-[min(80vh,100%)] aspect-square mx-auto shadow-2xl rounded-sm overflow-hidden"
            style={{ minWidth: '200px', position: 'relative' }}
        >
            <Chessboard
                options={{
                    position: fen,
                    boardOrientation: boardOrientation,
                    darkSquareStyle: darkSquareStyle,
                    lightSquareStyle: lightSquareStyle,
                    animationDurationInMs: disableAnimations ? 0 : 300,
                    onPieceDrop: handlePieceDrop,
                    squareStyles: mergedSquareStyles,
                    onMouseOverSquare: onMouseOverSquare ? ({ square }) => onMouseOverSquare(square) : undefined,
                    onMouseOutSquare: onMouseOutSquare ? ({ square }) => onMouseOutSquare(square) : undefined,
                    onSquareClick: ({ square, piece }) => handleSquareClick(square, piece?.pieceType),
                    allowDragging: movableColor !== null,
                    canDragPiece: ({ piece }) => isMovablePiece(piece.pieceType),
                }}
            />
            {/* Render arrows as SVG overlays */}
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 8 8"
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 50 }}
            >
                {arrows.map((arrow, idx) => {
                    // ...existing code...
                    const squareToCoords = (sq: string) => {
                        const file = sq.charCodeAt(0) - 97;
                        const rank = 8 - parseInt(sq[1]);
                        return [file + 0.5, rank + 0.5];
                    };
                    const [x1, y1] = squareToCoords(arrow.from);
                    const [x2, y2] = squareToCoords(arrow.to);
                    return (
                        <g key={idx}>
                            <line
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={arrow.color}
                                strokeWidth={0.09}
                                strokeDasharray={arrow.style === 'dashed' ? '0.2 0.2' : undefined}
                                opacity={0.95}
                                markerEnd={`url(#arrowhead-${idx})`}
                                filter="url(#arrow-glow)"
                            />
                            <marker
                                id={`arrowhead-${idx}`}
                                markerWidth={0.5}
                                markerHeight={0.5}
                                refX={0.25}
                                refY={0.25}
                                orient="auto"
                                markerUnits="strokeWidth"
                            >
                                <polygon points="0,0 0.5,0.25 0,0.5 0.12,0.25" fill={arrow.color} />
                            </marker>
                            {/* Animated Pulse Effect for Best Move Arrow */}
                            {arrow.style !== 'dashed' && (
                                <circle cx={x2} cy={y2} r="0.15" fill={arrow.color} opacity="0.5">
                                    <animate attributeName="r" from="0.1" to="0.3" dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                            )}
                        </g>
                    );
                })}
                {/* SVG filter for subtle glow */}
                <defs>
                    <filter id="arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="0.05" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>
        </div>
    );
}
