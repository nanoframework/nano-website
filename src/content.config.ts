import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { TAG_KEYS } from './data/site';

/**
 * Blog posts.
 *
 * One post = one Markdown file. Either:
 *   src/content/blog/<slug>.md
 *   src/content/blog/<slug>/index.md   (use a folder when the post has images)
 *
 * The <slug> becomes the URL: https://nanoframework.net/<slug>/
 * (same permalink shape WordPress used, so existing links keep working).
 */
const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
    generateId: ({ entry }) => entry.replace(/\/index\.mdx?$/, '').replace(/\.mdx?$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      author: reference('authors'),
      tags: z.array(z.enum(TAG_KEYS)).min(1),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
      /** Comments carried over from the WordPress blog, shown read-only under the post. */
      legacyComments: z
        .array(
          z.object({
            id: z.string(),
            parent: z.string().optional(),
            author: z.string(),
            date: z.coerce.date(),
            body: z.string(),
          }),
        )
        .default([]),
      /** Original WordPress post id (migration bookkeeping). */
      wordpressId: z.number().optional(),
    }),
});

/** Post authors, referenced from a post's `author:` field by id. */
const authors = defineCollection({
  loader: file('src/data/authors.json'),
  schema: z.object({
    name: z.string(),
    github: z.string().optional(),
    linkedin: z.url().optional(),
  }),
});

export const collections = { blog, authors };
