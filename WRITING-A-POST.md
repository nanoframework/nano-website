# Writing a blog post for nanoframework.net

👋 **Hi, and thank you!** If you're reading this, you've probably been invited to write a post for the
.NET nanoFramework blog. That's great news, and it's easier than it might look. Every post on the site is a
simple text file that lives in this repository. You write it, send it to us, and we take it from there.

You don't need to be a git expert. If anything below gets in your way, ask on
[Discord](https://discord.gg/gCyBu8T) and someone will happily help, or even do the git part for you.

---

## 1. Get a copy of the website

The friendliest way is [**GitHub Desktop**](https://desktop.github.com/), a free app that handles git for you.

1. Install GitHub Desktop and sign in with your GitHub account.
2. **File → Clone repository**, pick this repository and choose a folder on your computer.
3. **Branch → New branch**, and give it a name like `post-my-topic`.
   A branch is your own working copy: nothing you do here touches the live site until it's reviewed.

> **Tip:** ask us for write access to the repository before you start. Your post then gets its own
> **preview link**, so you (and we) can see exactly how it will look on the site before it's published.

## 2. Create your post

1. In the folder you cloned, go to `src/content/blog/`.
2. Create a new folder for your post. Its name becomes the post's web address, so keep it short,
   lowercase, with hyphens instead of spaces. For example: `getting-started-with-pico-2`
   → `nanoframework.net/getting-started-with-pico-2/`
3. Inside that folder, create a file called `index.md`. That's your post.
4. Put any pictures for your post in the same folder.

Any text editor works. [Visual Studio Code](https://code.visualstudio.com/) is a good choice: it shows a
live preview of Markdown files (right-click the file → *Open Preview*).

## 3. Write it

Follow the step-by-step instructions in the main [README → Writing a blog post](README.md#writing-a-blog-post).
They show the short header that goes at the top of the file (title, date, author, tags…) and how the rest of the
post is written.

A few extra pointers:

- **Add yourself as an author.** Add an entry with your name to `src/data/authors.json`, copying one of the
  existing ones, and use its `id` in your post's header. If this looks fiddly, just tell us and we'll add you.
- **Formatting is plain Markdown.** `## Heading` for section titles, `**bold**`, `[link text](https://…)`,
  and `![what the picture shows](./my-picture.png)` for images. The
  [Markdown guide](https://www.markdownguide.org/basic-syntax/) has everything else.
- **Code samples** go between three backticks, with the language after the first ones, for example
  ` ```csharp `. They're highlighted just like in Visual Studio.
- **Pictures:** describe every image in the `![…]` part. It helps readers using screen readers, and search
  engines. Screenshots and photos up to about 2 MB are fine; the site resizes them.
- **A cover picture** (optional) makes your post stand out on the blog page: add `cover: ./your-image.png`
  to the header.
- **Not finished yet?** Put `draft: true` in the header and the post stays hidden until you change it to `false`.
- **Tone:** friendly, practical and to the point. Show what you built, how, and what readers can try themselves.

## 4. Send it to us

1. In GitHub Desktop you'll see your changes listed. Write a short summary (e.g. "New post: getting started
   with Pico 2") and click **Commit**.
2. Click **Publish branch**, then **Create Pull Request**. This opens GitHub in your browser: add a line about
   your post and submit.
3. That's it! The site is built automatically to check for mistakes. If something's wrong (a missing title,
   an unknown tag), the pull request will show it; fix it in the same file, commit and push again.

We'll review your post, maybe suggest a few edits, and publish it. You'll find your post, with your name on it,
at its new address once it's merged.

## The small print

Blog posts are published under [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/): you keep the
copyright, others may share your post unchanged with credit, and adapting or translating it needs your
permission. By sending a pull request you agree to the [contribution terms](CONTRIBUTING.md), which also
let us make small editorial fixes (formatting, typos, broken links) when publishing your post.

Thanks again for writing for .NET nanoFramework! 💚
