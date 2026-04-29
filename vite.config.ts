import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: process.env.VITE_BASE_URL ?? './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        inviteflow: 'src/inviteflow/index.html',
        contactscout: 'src/contactscout/index.html',
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
