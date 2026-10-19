import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://thomasisalwayslate.github.io',
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'never',
  integrations: [sitemap()],
  redirects: {
    '/home': '/research',
    '/readme': '/research',
    '/rss.xml': '/research',
    '/notes/2026-08-24-sayonara-teaching-my-agents-to-die-well': '/research'
  },
  markdown: {
    shikiConfig: { theme: 'css-variables' }
  }
});
