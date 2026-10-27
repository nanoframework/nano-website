# Tagging links for visitor stats

The site uses [GoatCounter](https://www.goatcounter.com/) for privacy-friendly visitor stats: no cookies and no
personal data. This page shows how to tag the links you share, so the stats tell you **where visitors came from**.

Without a tag, a visit from a post on X, a newsletter or a Discord message often shows up as "direct" or an unhelpful
referrer. With a tag, it shows up under a name you chose.

## The one-minute version

Add `?ref=<name>` to the end of the link you share:

```
https://nanoframework.net/blog/?ref=newsletter-nov
```

That's it. The visit is counted under **`newsletter-nov`** in GoatCounter's referrers list. The tag is removed from
the page path in the stats, so it doesn't create duplicate pages.

If the link already has a `?` in it, join the tag with `&` instead:

```
https://example.com/some-page/?id=42&ref=newsletter-nov
```

## Naming tags

Short, lowercase, words separated by hyphens. Keep the same names every time so the numbers add up.

| Pattern | Use it for | Example |
|---|---|---|
| `<channel>` | A channel you use regularly | `ref=x`, `ref=linkedin`, `ref=discord` |
| `<channel>-<month>` | A recurring newsletter or post series | `ref=newsletter-nov` |
| `<campaign>-<channel>` | One announcement shared in several places | `ref=v2-release-x`, `ref=v2-release-linkedin` |
| `<event>` | A talk, conference or video | `ref=dotnetconf-2026`, `ref=yt-getting-started` |
| `email-signature` | Links in team email signatures | `ref=email-signature` |
| `qr-<where>` | A QR code on printed material or a slide | `ref=qr-booth`, `ref=qr-slide-12` |

Avoid spaces, capital letters, and anything personal (names, email addresses).

## Recipes

**Share a new blog post on several channels**

```
https://nanoframework.net/my-new-post/?ref=my-post-x
https://nanoframework.net/my-new-post/?ref=my-post-linkedin
https://nanoframework.net/my-new-post/?ref=my-post-discord
```

Use a different tag for each channel, and you can compare them afterwards.

**Release announcement**

```
https://nanoframework.net/blog/?ref=release-2026-11
```

**A conference talk or workshop slide**

Use a QR code or a short link with `ref=<event>`, for example
`https://nanoframework.net/support-nanoframework/?ref=dotnetconf-2026`. Send people to the page that matches the
talk, not just the home page.

**A sponsorship or partner pitch**

```
https://nanoframework.net/support-nanoframework/?ref=sponsor-pitch
https://nanoframework.net/partner-program/?ref=partner-pitch
```

**Campaign-style tags**

GoatCounter also understands the usual `utm_` tags. Use them when a tool or platform adds them for you, or if you
want to group visits under a named campaign:

```
https://nanoframework.net/?utm_source=newsletter&utm_medium=email&utm_campaign=autumn-2026
```

For everyday use, plain `ref=` is simpler and is all you need.

## Where to see the results

1. Open the GoatCounter dashboard for the site.
2. **Referrers** (sometimes labelled "Sites") lists your tags next to normal sources. Click a tag to see which pages
   those visitors viewed.
3. If you use `utm_campaign`, it appears in the **Campaigns** list.

Numbers can take a minute to appear. They are an undercount, because some visitors use tracker blockers, so compare
tags with each other rather than treating them as exact totals.

## Clicks on the site's own links

The site also records clicks on its buttons and outbound links, as GoatCounter **events** named
`click/<where on the page>/<destination>`, for example `click/community/discord` or `click/start/extension-vscode`.
This happens automatically, and nothing needs tagging for it.

To give one link its own name, add `data-track` with a `where/name` value:

```html
<a href="https://discord.gg/..." data-track="blog-post/discord">Join us on Discord</a>
```

The click is then counted as `click/blog-post/discord`. In Markdown posts, use an HTML link like the one above.

## Good to know

- **Tags are public.** Anyone can see the tag in the link, so don't put anything private in it.
- **Don't tag links inside the site.** Links between pages of nanoframework.net need no tag, because a visit
  from another page is counted already.
- **Questions?** Ask on [Discord](https://discord.gg/gCyBu8T).
