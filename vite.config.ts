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

  // For production build, allow VITE_BASE_PATH or GITHUB_PAGES override, otherwise default to '/'
  return {
    base: process.env.VITE_BASE_PATH || (process.env.GITHUB_PAGES ? '/students-circle/' : '/'), 
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
