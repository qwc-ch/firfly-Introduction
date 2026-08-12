import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { avifPlugin } from './vite-plugin-avif.mjs';

export default defineConfig({
  plugins: [
    svelte(),
    tailwindcss(),
    avifPlugin({ quality: 65 })
  ],
  publicDir: 'static',
  build: {
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 5173
  }
});
