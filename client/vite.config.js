import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies API + image requests to the Express backend (port
// 3000) so the React app can be developed with `npm run dev` here while
// `node src/server.js` keeps serving data from the project root.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/images': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
  },
});
