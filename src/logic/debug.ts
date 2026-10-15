/**
 * Development-only debug logging.
 *
 * Silent in production builds (`NODE_ENV === 'production'`), so gameplay in
 * a production build produces no console output. Real warnings and errors
 * keep using `console.warn` / `console.error` directly.
 */
export function debug(...args: unknown[]): void {
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log(...args);
    }
}
