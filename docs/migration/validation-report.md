# Blog MDX validation report

Validated on 2026-08-11 against the production build served by `next start`.

## Automated checks

- `npm test`: 9 files, 31 tests passed.
- `npm run content:validate`: 94 published posts passed frontmatter, MDX,
  internal-link, and image validation.
- `npm run typecheck`: passed with no TypeScript errors.
- `npm run build`: passed; 144 static pages were generated, including all 94
  article routes.

## Browser checks

Playwright checked `/blog` and these ten representative articles at a
1440 x 1000 viewport:

1. `n8n-local-installation-guide-2`
2. `n8n-workflow-automation-guide`
3. `n8n-vs-zapier-comparison`
4. `alt-attribute-guide`
5. `canonical-guide`
6. `flutter-mvvm-riverpod-guide`
7. `gemini-image-generation-guide`
8. `react2shell-vulnerability-alert`
9. `cloudflare-pay-per-crawl-blog-value`
10. `descartes-philosophy-guide`

Every sampled route returned HTTP 200 and rendered one H1 and one article.
Canonical and Open Graph URLs matched the public URL, and each article emitted
both article and breadcrumb JSON-LD. Across the sampled article bodies there
were no external image sources, missing `alt` attributes, or missing intrinsic
image dimensions.

A full generated-HTML scan found 224 article images. All 224 use local paths
and include both intrinsic width and height; no remote or unsized article image
remains.

The same ten URLs were compared with the current production site. Nine matched
in H1, headings, article text, and image inventory. `alt-attribute-guide` has
one intentional difference: an unreachable sample image is now rendered as an
HTML code example instead of producing a broken image request. Its H1 and
heading structure are unchanged.

No browser request targeted the retired content service. `/feed`,
`/sitemap.xml`, and `/robots.txt` returned HTTP 200 with the expected content
types and canonical site URL.

The only HTTP failure under local `next start` was
`/_vercel/insights/script.js` returning 404. That endpoint is injected and
served by Vercel after deployment; no application or article request failed.

## Visual evidence

Local Playwright artifacts are kept outside version control:

- `output/playwright/blog-index-final.png`
- `output/playwright/article-alt-attribute-guide-final.png`
- `output/playwright/article-alt-attribute-guide-production.png`

Visual inspection confirmed that the index masonry layout, article typography,
table of contents, inline images, related articles, and calls to action retain
their existing presentation.
