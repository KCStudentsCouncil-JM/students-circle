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

  // Support custom base path, GitHub Actions repository deployment (e.g. /<repo>/), or relative path for build
  let base = process.env.BASE_PATH || './';
  if (!process.env.BASE_PATH && process.env.GITHUB_REPOSITORY) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    const repo = parts[1];
    const owner = parts[0];
    if (repo && repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
      base = '/';
    } else if (repo) {
      base = `/${repo}/`;
    }
  }

  return {
    base,
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
