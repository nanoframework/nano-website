import { getCollection, type CollectionEntry } from 'astro:content';
import { POSTS_PER_PAGE, TAGS, type TagKey } from '../data/site';

export type Post = CollectionEntry<'blog'>;

/**
 * Published posts, newest first.
 * Drafts are hidden, and so are posts dated in the future: they go live
 * on the next build after their date (a daily scheduled build handles that).
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const now = Date.now();
  const posts = await getCollection(
    'blog',
    ({ data }) => (import.meta.env.DEV || !data.draft) && (import.meta.env.DEV || data.date.valueOf() <= now),
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getLatestPosts(count: number): Promise<Post[]> {
  return (await getPublishedPosts()).slice(0, count);
}

/** WordPress-compatible permalink: /<slug>/ */
export const postUrl = (post: Post) => `/${post.id}/`;

export const tagUrl = (tag: TagKey) => `/tag/${tag}/`;
export const tagLabel = (tag: TagKey) => TAGS[tag];

export const pageUrl = (page: number) => (page <= 1 ? '/blog/' : `/blog/page/${page}/`);

export function paginate<T>(items: T[], page: number, perPage = POSTS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  return {
    items: items.slice((page - 1) * perPage, page * perPage),
    totalPages,
  };
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const longFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const formatDate = (d: Date) => dateFmt.format(d);
export const formatDateLong = (d: Date) => longFmt.format(d);
