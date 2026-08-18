import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    /**
     * The scene's chunk is large and that is fine — what matters is that it is
     * not on the critical path. It is behind `React.lazy` in
     * `SingularityStage`, so nothing about the first paint waits for it.
     */
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        /**
         * `three` is deliberately NOT named here, and that is the whole point.
         *
         * Naming a package in `manualChunks` promotes it to a shared chunk of
         * the entry graph, and Vite then emits a `<link rel="modulepreload">`
         * for it in `index.html`. The effect was that the 806kB of Three.js
         * was fetched during the first paint even though `SingularityCanvas`
         * is lazily imported — the lazy boundary was deferring execution while
         * the preload had already paid for the download.
         *
         * Left alone, Rollup folds Three into the lazy chunk that actually
         * needs it, which is not preloaded. Measured on the built output, the
         * first paint goes from index + gsap + three (1227kB, 366kB gzip) to
         * index + gsap (428kB, 149kB gzip).
         *
         * GSAP stays named: it is imported from the critical path *and* from
         * the lazy scene, so without this it would be emitted into both.
         */
        manualChunks: {
          gsap: ['gsap'],
        },
      },
    },
  },
});
