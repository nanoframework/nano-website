import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts, postUrl } from '../lib/posts';
import { SITE } from '../data/site';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: `${SITE.name} blog`,
    description: SITE.tagline,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: postUrl(post),
      categories: post.data.tags,
    })),
    customData: '<language>en</language>',
  });
}
