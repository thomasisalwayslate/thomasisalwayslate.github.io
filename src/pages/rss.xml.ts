import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { publishedArticles, articleUrl } from '../lib/articles';

export async function GET(context: APIContext) {
  return rss({
    title: 'Thomas — research',
    description: 'Research notes and experiments by thomasisalwayslate.',
    site: context.site!,
    trailingSlash: false,
    items: (await publishedArticles()).map(article => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.published,
      link: articleUrl(article),
    })),
    customData: '<language>en</language>',
  });
}
