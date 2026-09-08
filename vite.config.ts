import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Object-form manual chunks pull transitive dependencies into the
          // named chunk. That made React depend on the lazy Three bundle and
          // caused Vite to modulepreload ~800 kB on the first page. Assign
          // only the matching modules so the Canvas remains genuinely lazy.
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'react';
          }
          if (id.includes('/node_modules/three/') || id.includes('/@react-three/fiber/')) {
            return 'three';
          }
          if (id.includes('/node_modules/gsap/')) return 'gsap';
          return undefined;
        },
      },
    },
  },
});
