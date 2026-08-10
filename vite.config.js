import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react({
            jsxRuntime: 'classic',
        }),
    ],
    resolve: {
        // Force face-api ET mobilenet à partager le même @tensorflow/tfjs-core
        // (sinon deux versions se battent → "t3 is not a function")
        dedupe: ['@tensorflow/tfjs', '@tensorflow/tfjs-core'],
        alias: {
            '@tensorflow/tfjs-core': path.resolve(__dirname, 'node_modules/@tensorflow/tfjs-core'),
        },
    },
});