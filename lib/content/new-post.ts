import { postFrontmatterSchema } from "./post-schema"

export interface NewPostInput {
  title: string
  description: string
  date: string
  slug: string
  categories: string[]
  tags: string[]
}

export function createPostTemplate(input: NewPostInput): string {
  const metadata = postFrontmatterSchema.parse({
    ...input,
    draft: true,
  })

  return `---
title: ${JSON.stringify(metadata.title)}
description: ${JSON.stringify(metadata.description)}
date: ${input.date}
slug: ${metadata.slug}
categories: ${JSON.stringify(metadata.categories)}
tags: ${JSON.stringify(metadata.tags)}
draft: true
---

## はじめに

この記事で読者が得られることを書きます。

## 本文

内容を書きます。

## まとめ

要点と次のアクションを書きます。
`
}
