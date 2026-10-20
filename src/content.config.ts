import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({
    pattern: process.env.NODE_ENV === 'production' ? '*.{md,json}' : ['*.{md,json}', 'drafts/*.md'],
    base: './src/content/articles',
    generateId: ({ entry }) => entry.split('/').at(-1)!.replace(/\.(md|json)$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string().optional(),
    author: z.literal('thomasisalwayslate').default('thomasisalwayslate'),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    status: z.enum(['published', 'draft']).default('draft'),
    kind: z.enum(['markdown', 'interactive']).default('markdown'),
    cover: z.string().optional(),
    still: z.string().nullable().optional(),
    versionNote: z.string().optional(),
    sharedArticle: z.boolean().default(false),
  }),
});

export const collections = { articles };
