# tent space corporate site

## Article workflow

1. Create a `claude/` branch for one article.
2. Scaffold the draft:

   ```bash
   npm run content:new -- \
     --slug lowercase-ascii-slug \
     --title "記事タイトル" \
     --description "160文字以内の概要" \
     --categories AI \
     --tags MDX,SEO \
     --hook howto \
     --cta contact \
     --target-kw "検索キーワード" \
     --utm-campaign blog_2026w33
   ```

3. Write the article in `content/posts/<slug>/index.mdx` and the future social
   copy in the generated `social.md`.
4. Run `npm run content:validate`, `npm test`, `npm run typecheck`, and
   `npm run build`.
5. Open a PR. Merging to `main` publishes articles whose `draft` is `false`.

## Frontmatter

Required fields:

```yaml
title: "記事タイトル"
description: "160文字以内の概要"
date: 2026-08-11
slug: lowercase-ascii-slug
categories: [AI]
tags: [MDX, SEO]
draft: true
```

Optional fields:

```yaml
updated: 2026-08-12
ogImage: /blog-assets/example/featured.webp
experiment:
  hook: howto # question | number | contrarian | story | howto
  cta: contact
  targetKw: "検索キーワード"
  utmCampaign: blog_2026w33
```

- The directory name and `slug` must match.
- `slug` contains only lowercase ASCII letters, numbers, and hyphens.
- New posts start with `draft: true`. Set it to `false` only when the PR is
  ready to publish.
- `categories` drives category navigation. `tags` are article keywords.
- `experiment` records the article hypothesis and downstream campaign key.
- Images live under `public/` and use root-relative paths. Content validation
  verifies each local image and adds width and height at build time.
- GFM tables and fenced code blocks are supported. Use `<YouTube id="..." />`
  or `<XEmbed url="..." />` when an embed is required.

## Branch and PR rules

- Use the `claude/` prefix. Never push directly to `main`.
- Keep one article per PR.
- State the target reader, search intent, hook hypothesis, CTA, and validation
  results in the PR description.
- Content-only PRs may change only `content/posts/<slug>/**` and article-owned
  assets. Code, workflow, rubric, facts, and policy changes require human review.
- Do not publish until generated files are current and every CI check is green.

## Writing style

HIRO fills in this policy before automated article publication is enabled.

### Intended reader

TBD by HIRO.

### Tone

TBD by HIRO.

### First person

TBD by HIRO.

### Prohibited expressions

TBD by HIRO.

### Three reference articles

TBD by HIRO.

## Prohibited changes

- Do not assert unverified facts. Provide a primary source for factual claims.
- Do not introduce claims about a person or another company without following
  the human-approved editorial policy.
- Do not rewrite a published article without explicit approval.
- Do not reintroduce a runtime dependency on a retired content service.
- Do not commit credentials, API keys, local environment files, or source-system
  identifiers.
- Do not let an article PR modify CI, review rules, ownership, hooks, or
  auto-merge policy.

## Content implementation

`npm run content:validate` validates frontmatter, compiles every MDX body,
checks internal article links and local images, and regenerates
`content-manifest.json` plus `content-rendered.json`. The presentation layer
reads those generated files. Likes, favorites, comments, and authentication
remain Supabase-backed and use the article slug.

Agent and crawler discovery is static: `/llms.txt` lists every published
article, `/content-manifest.json` exposes the generated manifest, and
`/blog/<slug>/index.md` serves the repository-owned MDX source as Markdown.
