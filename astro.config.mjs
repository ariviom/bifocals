// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'server',

  // Use this adapter for local development
  // adapter: node({
  //   mode: 'standalone'
  // }),

  // Use this adapter for Netlify deployment
  adapter: netlify(),
});