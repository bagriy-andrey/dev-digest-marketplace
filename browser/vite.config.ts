import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed as a GitHub Pages sub-path (<pages-url>/browser/) whose exact
// prefix depends on the repo name, so use relative asset URLs instead of
// hardcoding a base path.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '../site/browser',
    emptyOutDir: true,
  },
})
