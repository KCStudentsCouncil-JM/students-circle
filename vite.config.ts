import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  // In dev server ('serve'), base MUST always be '/' so Vite dev assets and client HMR load cleanly
  if (command === 'serve') {
    return {
      base: '/',
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(import.meta.dirname, '.'),
        },
      },
      server: {
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
    };
  }

  // For GitHub Pages production build, hardcode your repository name
  return {
    base: '/students-circle/', 
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
