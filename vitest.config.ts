import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        // The existing suite uses Jest globals (`describe`, `test`, `expect`).
        globals: true,
        environment: 'node',
        include: ['__tests__/**/*.test.ts'],
    },
});
