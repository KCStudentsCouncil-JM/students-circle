import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa'; // 1. Import the plugin

const detectBase = (): string => {
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH;
  if (process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    return `/${repo}/`;
  }
  return '/';
};

export default defineConfig(({ command }) => {
  const base = command === 'serve' ? '/' : detectBase();

  return {
    base,
    plugins: [
      react(), 
      tailwindcss(),
      // 2. Add the PWA plugin here
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['KCBCALogo.png'], // Assets to cache
        manifest: {
          name: 'KC Students Circle',
          short_name: 'KC Circle',
          description: 'Kingston College Student Feedback & Campus Request Assistant',
          theme_color: '#6b21a8', // Purple-800
          background_color: '#faf8fc', // Your app's light background
          display: 'standalone', // Makes it look like a native app (no browser bar)
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'KCBCALogo.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'KCBCALogo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'KCBCALogo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable' // Ensures the icon looks good on Android adaptive icons
            }
          ]
        }
      })
    ],
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
