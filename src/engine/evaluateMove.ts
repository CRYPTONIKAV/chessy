import { EngineEvaluation, AnalysisLine } from './types';

class StockfishEngine {
    private worker: Worker | null = null;
    private onEvalCallback: ((evaluation: EngineEvaluation) => void) | null = null;
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
        // console.log('Engine Output:', line);

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
            if (this.onEvalCallback) {
                const bestLine = this.currentEval.lines[0];
                const result: EngineEvaluation = {
                    bestMove: bestLine?.bestMove || '',
                    evaluation: bestLine?.evaluation || 0,
                    mate: bestLine?.mate,
                    depth: this.currentEval.depth,
                    lines: this.currentEval.lines
                };
                this.onEvalCallback(result);
                this.onEvalCallback = null;
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

    public async evaluate(fen: string, depth = 15, multiPV = 1): Promise<EngineEvaluation> {
        return new Promise((resolve) => {
            // Reset state
            this.currentEval = { depth: 0, lines: [] };
            this.sideToMove = fen.split(' ')[1] === 'b' ? 'b' : 'w';

            this.sendCommand('stop'); // Stop any previous search
            this.sendCommand(`setoption name MultiPV value ${multiPV}`);
            this.sendCommand(`position fen ${fen}`);
            this.sendCommand(`go depth ${depth}`);

            this.onEvalCallback = (evaluation) => {
                resolve(evaluation);
            };
        });
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
