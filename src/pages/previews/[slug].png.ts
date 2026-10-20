import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';

// Draft OG cards exist only in local development, never in the production build.
export async function getStaticPaths() {
  if (!import.meta.env.DEV) return [];
  return (await getCollection('articles', ({ data }) => data.status === 'draft'))
    .map(article => ({ params: { slug: article.id } }));
}
export const GET: APIRoute = async ({ params }) => {
  if (!import.meta.env.DEV || !params.slug || !/^[a-z0-9-]+$/.test(params.slug)) return new Response(null, { status: 404 });
  const image = await readFile(new URL(`../../content/articles/drafts/assets/${params.slug}-og.png`, import.meta.url));
  return new Response(image, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
};
