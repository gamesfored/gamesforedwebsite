// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://spicadesignwork.github.io',
  // Only use base path in production (GitHub Pages)
  base: process.env.NODE_ENV === 'production' ? '/gamesfored' : undefined,
});
