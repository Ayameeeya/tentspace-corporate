# Frontmatter specification

このファイルは `lib/content/post-schema.ts` の記事メタデータ仕様を、執筆時に
参照しやすい形で表したもの。実装と不一致を見つけた場合は記事側で回避せず、
人間レビューが必要な設定変更として報告する。

## 必須フィールド

| フィールド | 型・制約 |
|---|---|
| `title` | 1〜80文字 |
| `description` | 1〜160文字 |
| `date` | `YYYY-MM-DD` |
| `slug` | 小文字ASCII英数字とハイフンのみ。ディレクトリ名と一致 |
| `categories` | 文字列配列 |
| `tags` | 文字列配列 |
| `draft` | 新規雛形は `true` |

## 任意フィールド

- `updated`: 更新日（`YYYY-MM-DD`）
- `ogImage`: `public/` 内画像を指すルート相対パス

## 新規記事で必須の experiment

移行済み記事との互換性のため `experiment` 自体はスキーマ上省略可能だが、
新規記事では必ず設定する。設定する場合、次の4項目はすべて必須。

| フィールド | 値 |
|---|---|
| `hook` | `question` / `number` / `contrarian` / `story` / `howto` |
| `cta` | `inquiry` / `app-download` / `camp-reservation` / `note-paid` |
| `targetKw` | 主検索語。空文字禁止 |
| `utmCampaign` | 記事仮説を追跡するキャンペーン名。空文字禁止 |

CTA の意味と使い分けは `docs/style-guide.md` を正とする。指定がなければ
`inquiry` を使う。

### experiment.pillar

記事の発信軸は `experiment.pillar` に記録する。値は次のいずれかを使う。

- `ai-dev`: AI を使った開発・仕事の実践知
- `build-public`: 事業やプロダクトを作る過程と学び

## 例

```yaml
---
title: "記事タイトル"
description: "読者が得る価値を160文字以内で説明する"
date: 2026-08-14
slug: example-article
categories: [AI]
tags: [自動化, MDX]
draft: true
experiment:
  pillar: ai-dev
  hook: howto
  cta: inquiry
  targetKw: "AI 業務自動化"
  utmCampaign: blog_2026w33
---
```

## 本文・配信上の制約

- 画像は `public/` 配下に保存し、`/blog-assets/...` のようなルート相対パスを使う。
- 内部記事リンクは `/blog/<slug>` を使う。
- 同じ記事ディレクトリに `social.md` を置く。
- `draft: false` は公開準備とレビューが完了した PR でのみ設定する。
