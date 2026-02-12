
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use './' to make all paths relative to the index.html location
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure the manifest is generated and placed correctly
    manifest: true,
  }
});
