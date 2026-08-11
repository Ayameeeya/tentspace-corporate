# tent space corporate site

## Blog content

The blog is repository-owned MDX. Published content lives at
`content/posts/<slug>/index.mdx`; do not add a runtime CMS fetch.

Required frontmatter:

```yaml
---
title: "記事タイトル"
description: "160文字以内の概要"
date: 2026-08-11
slug: lowercase-ascii-slug
categories: [SEO]
tags: [MDX, コンテンツ運用]
draft: true
ogImage: /blog-placeholders/example.jpg
---
```

- The directory name and `slug` must match.
- `slug` must contain only lowercase ASCII letters, numbers, and hyphens.
- New posts are drafts by default. Set `draft: false` or remove the field to publish.
- Store images under `public/` and use a root-relative `ogImage` path.
- `categories` drives category navigation; `tags` are article keywords.
- GFM tables and fenced code blocks are supported. Use `<YouTube id="..." />` for videos.
- Run `npm run content:new -- --slug ... --title ... --description ... --categories テクノロジー --tags MDX,SEO` to scaffold a post.
- Run `npm run content:validate` after editing. It validates frontmatter, compiles every MDX body, and regenerates `content-manifest.json` plus `content-rendered.json`.
- `npm run content:migrate-all` is the read-only legacy import. It requires the connector inventory in `docs/migration/tentspace-blog-inventory.json`, fetches matching public article HTML, localizes and optimizes images, validates all staged MDX, and only then replaces `content/posts`.
- Run `npm test` and `npm run build` before merging. The build also runs content validation.

The presentation layer reads metadata from `content-manifest.json`. The article route reads precompiled HTML from `content-rendered.json` and passes it to the existing article UI. Likes, favorites, comments, and authentication remain Supabase-backed and use the article slug.
