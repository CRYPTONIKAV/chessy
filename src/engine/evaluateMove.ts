import { EngineEvaluation, AnalysisLine } from './types';

interface SearchRequest {
    fen: string;
    depth: number;
    multiPV: number;
    moveTimeMs?: number;
    cancelled: boolean;
    resolve: (evaluation: EngineEvaluation | null) => void;
}

class StockfishEngine {
    private worker: Worker | null = null;
    // Stockfish runs one search at a time. A new request never starts until the
    // running search has sent its "bestmove", so output is never mixed between
    // searches. Only the newest waiting request is kept.
    private current: SearchRequest | null = null;
    private pending: SearchRequest | null = null;
    private isReady = false;
    // Stockfish reports scores from the side to move's point of view.
    // We remember who is to move so scores can be converted to White's view.
    private sideToMove: 'w' | 'b' = 'w';
    private currentEval: {
        depth: number;
        lines: AnalysisLine[];
    } = { depth: 0, lines: [] };

    constructor() {
        if (typeof window !== 'undefined') {
            this.worker = new Worker('/stockfish.js');
            this.worker.onmessage = (e) => this.handleMessage(e.data);
            this.sendCommand('uci');
        }
    }

    private handleMessage(line: string) {

        if (line === 'uciok') {
            this.isReady = true;
            this.sendCommand('isready');
        }

        if (line.startsWith('info depth')) {
            const analysis = this.parseInfoLine(line);
            if (analysis) {
                // Remove existing line with same multipv index if exists
                this.currentEval.lines = this.currentEval.lines.filter(l => l.multipv !== analysis.multipv);
                this.currentEval.lines.push(analysis as AnalysisLine);
                this.currentEval.lines.sort((a, b) => a.multipv - b.multipv);

                // Update depth from the latest info line
                // Note: technically each line has a depth, but they should be consistent in a batch
                // We'll use the depth from the line
                // But parseInfoLine returns Partial<AnalysisLine>, we need to extract depth separately or return it
            }
        }

        if (line.startsWith('bestmove')) {
            const finished = this.current;
            this.current = null;
            if (finished) {
                const bestLine = this.currentEval.lines[0];
                // "bestmove e2e3 ponder d7d5": this is the move the engine actually
                // chooses, which "Skill Level" weakens. The PV's first move is the
                // strongest move and is what we use for analysis.
                const chosen = line.split(' ')[1];
                const result: EngineEvaluation = {
                    bestMove: bestLine?.bestMove || '',
                    engineMove: chosen && chosen !== '(none)' ? chosen : undefined,
                    evaluation: bestLine?.evaluation || 0,
                    mate: bestLine?.mate,
                    depth: this.currentEval.depth,
                    lines: this.currentEval.lines
                };
                // A search stopped early for a newer request resolves with null
                finished.resolve(finished.cancelled ? null : result);
            }
            if (this.pending) {
                const next = this.pending;
                this.pending = null;
                this.start(next);
            }
        }
    }

    private sendCommand(command: string) {
        if (this.worker) {
            this.worker.postMessage(command);
        }
    }

    public setOption(name: string, value: string | number) {
        this.sendCommand(`setoption name ${name} value ${value}`);
    }

    /**
     * Search a position until `depth` is reached or `moveTimeMs` has elapsed,
     * whichever comes first. The time cap keeps deep levels responsive: the
     * bundled single-threaded Stockfish can take many seconds per extra ply.
     *
     * If a search is already running it is stopped and this one runs next.
     * Requests that get superseded resolve with `null`.
     */
    public evaluate(fen: string, depth = 15, multiPV = 1, moveTimeMs?: number): Promise<EngineEvaluation | null> {
        return new Promise((resolve) => {
            const request: SearchRequest = { fen, depth, multiPV, moveTimeMs, cancelled: false, resolve };

            if (!this.current) {
                this.start(request);
                return;
            }

            this.pending?.resolve(null);
            this.pending = request;
            if (!this.current.cancelled) {
                this.current.cancelled = true;
                this.sendCommand('stop');
            }
        });
    }

    /** Stop any running search and drop the queued one. */
    public stop() {
        this.pending?.resolve(null);
        this.pending = null;
        if (this.current && !this.current.cancelled) {
            this.current.cancelled = true;
            this.sendCommand('stop');
        }
    }

    private start(request: SearchRequest) {
        this.current = request;
        this.currentEval = { depth: 0, lines: [] };
        this.sideToMove = request.fen.split(' ')[1] === 'b' ? 'b' : 'w';

        this.sendCommand(`setoption name MultiPV value ${request.multiPV}`);
        this.sendCommand(`position fen ${request.fen}`);
        this.sendCommand(request.moveTimeMs
            ? `go depth ${request.depth} movetime ${request.moveTimeMs}`
            : `go depth ${request.depth}`);
    }

    private parseInfoLine(line: string): AnalysisLine | null {
        const depthMatch = line.match(/depth (\d+)/);
        const scoreMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        const multipvMatch = line.match(/multipv (\d+)/);

        // Robust PV parsing
        let pv: string[] = [];
        const pvIndex = line.indexOf(' pv ');
        if (pvIndex !== -1) {
            const pvString = line.substring(pvIndex + 4);
            pv = pvString.split(' ').filter(token => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(token));
        }

        // Progress lines such as "info depth 20 currmove e2e4 currmovenumber 1"
        // carry no score or PV and must not overwrite a real analysis line.
        if (!depthMatch || (!scoreMatch && !mateMatch) || pv.length === 0) return null;

        const depth = parseInt(depthMatch[1], 10);
        this.currentEval.depth = Math.max(this.currentEval.depth, depth);

        let evaluation = 0;
        let mate: number | undefined;

        if (scoreMatch) {
            evaluation = parseInt(scoreMatch[1], 10);
        } else if (mateMatch) {
            mate = parseInt(mateMatch[1], 10);
            evaluation = mate > 0 ? 10000 : -10000;
        }

        // Normalize to White's point of view (positive = White is better)
        if (this.sideToMove === 'b') {
            evaluation = -evaluation;
            if (mate !== undefined) mate = -mate;
        }

        const multipv = multipvMatch ? parseInt(multipvMatch[1], 10) : 1;

        return {
            multipv,
            bestMove: pv[0] || '',
            evaluation,
            mate,
            pv
        };
    }

    public terminate() {
        if (this.worker) {
            this.worker.terminate();
        }
    }
}

// Export a singleton instance
export const engineService = typeof window !== 'undefined' ? new StockfishEngine() : null;
