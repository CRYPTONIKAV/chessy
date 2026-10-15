/* eslint-disable @typescript-eslint/no-explicit-any */

// This is a Web Worker for Stockfish
let engine: any = null;

const initEngine = (stockfishJsUrl: string) => {
    if (typeof (self as any).importScripts === 'function') {
        try {
            (self as any).importScripts(stockfishJsUrl);
            if ((self as any).Stockfish) {
                engine = (self as any).Stockfish();

                engine.onmessage = (event: any) => {
                    const line = typeof event === 'object' ? event.data : event;
                    self.postMessage(line);
                };

            }
        } catch (e) {
            console.error('Failed to initialize Stockfish:', e);
        }
    }
};

self.onmessage = (e: MessageEvent) => {
    const { command, stockfishJsUrl } = e.data;

    if (command === 'init') {
        initEngine(stockfishJsUrl || '/stockfish.js');
        return;
    }

    if (engine) {
        engine.postMessage(command);
    } else {
        console.warn('Engine not initialized. Call "init" first.');
    }
};
