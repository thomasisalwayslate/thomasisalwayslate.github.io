import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import articleHeadings from './scripts/article-headings.mjs';
import { satteri, satteriHeadingIdsPlugin } from '@astrojs/markdown-satteri';

export default defineConfig({
  site: 'https://thomasisalwayslate.github.io',
  output: 'static',
  devToolbar: { enabled: false },
  trailingSlash: 'never',
  integrations: [sitemap()],
  redirects: {
    '/home': '/research',
    '/readme': '/research',
    '/notes/2026-08-24-sayonara-teaching-my-agents-to-die-well': '/research'
  },
  markdown: {
    processor: satteri({ hastPlugins: [() => satteriHeadingIdsPlugin(), articleHeadings()] }),
    shikiConfig: { theme: 'css-variables' }
  }
});
