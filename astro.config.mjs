import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tellingfoxer.github.io',
  base: '/LandingPage-IanLcr',
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
});
