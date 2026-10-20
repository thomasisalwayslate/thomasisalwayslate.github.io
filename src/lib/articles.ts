import { getCollection, type CollectionEntry } from 'astro:content';
import huhuSource from '../content/articles/huhu.astro?raw';

export type Article = CollectionEntry<'articles'>;
export type ArticleHeading = { depth: number; slug: string; text: string };
export const articleUrl = (article: Article) => `/research/${article.id}`;
export const displayDate = (date: Date) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(date);

export async function publishedArticles() {
  return (await getCollection('articles', ({ data }) => data.status === 'published'))
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
}

export function readingMinutes(article: Article) {
  const source = article.data.kind === 'interactive' ? huhuSource : article.body ?? '';
  const text = source.replace(/^---[\s\S]*?---/, '').replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  return Math.max(1, Math.ceil(text.trim().split(/\s+/u).length / 200));
}

export function interactiveHeadings(): ArticleHeading[] {
  return [...huhuSource.matchAll(/<h([23]) id="([^"]+)">([^<]+)/g)].map(match => ({
    depth: Number(match[1]), slug: match[2], text: match[3],
  }));
}
