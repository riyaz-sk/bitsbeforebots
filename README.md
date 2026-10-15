# Bits Before Bots

Riyaz Shaik’s personal portfolio and engineering journal, built with Astro. Static output is configured for https://bitsbeforebots.com.

## Develop and build

```sh
npm install
npm run dev
npm run build
npm run preview
```

Deploy the `dist/` directory to a static host. No server runtime is required. The hosting provider must serve `404.html` for missing routes.

## Content

Essays live in `src/content/writing/`; see its README for frontmatter and draft controls. Published articles use the author’s supplied content.

Work focus areas and related article links live in `src/pages/work.astro`. Experience shows the supplied Oracle America Inc. role.

The shared layout and design system live in `src/layouts/BaseLayout.astro` and `src/styles/global.css`. The old journal override stylesheet and concept SVGs are retained but are not loaded. Contact links use the supplied LinkedIn profile; add other links once verified.

## Homepage mascot

The writing-first homepage uses the `page-mascot` React component as an Astro island. The cat direction and reaction sheets are served locally from `public/mascots/`, downloaded from https://koboyo.com/page-mascot. The upstream MIT license is included in that directory. Clicking or tapping the cat changes its expression; cursor tracking is enabled for a fine pointer. The component respects reduced-motion preferences for the click animation.

Homepage topics link to the writing archive with a shareable topic query. Filters update the URL and restore their selection on browser back/forward navigation.

## Reading layout

The shared layout provides desktop navigation and a mobile disclosure menu. Home and Writing use `EssayFeed.astro` and `AuthorSidebar.astro`; the right sidebar follows the feed on smaller screens. Social icons are shared by `SocialLinks.astro`.

The header search submits to `/writing?q=...`. On the writing archive, search filters titles, summaries, and categories as you type, combines with `topic`, and restores state with browser history. Search is local to the published article metadata; no external search service is used.

The Oracle wordmark at `public/logos/oracle.png` is the original PNG from Oracle’s newsroom logo download: https://www.oracle.com/a/pr/docs/oracle-logo.zip.
