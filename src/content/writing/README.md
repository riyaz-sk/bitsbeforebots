# Writing

Add a Markdown or MDX essay here. README.md is excluded from the collection.

Required frontmatter: `title`, `description`, `category` (Infrastructure, DevOps, or AI engineering), `date` (YYYY-MM-DD), and `readingTime`.

Use `draft: true` to exclude an essay from every public page.

Add 3-5 specific topics with `tags`, for example:

```yaml
tags: ["RAG", "Hybrid Search", "MCP", "Retrieval Quality"]
```

Tags are optional, limited to five unique labels of at most 40 characters each.
Reuse existing spelling and capitalization. Keep `category` broad and tags
specific; do not include `#` prefixes. Tags appear as links on articles and feeds,
filter the Writing page through `?tag=`, and are included in site-search text.
Tag, category, and text filters can be combined. Draft-only tags are not exposed
in the public filter. Tags are for discovery, not SEO meta-keyword stuffing.

The filename becomes the article URL: `my-essay.md` → `/writing/my-essay/`.
