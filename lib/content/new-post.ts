import { postFrontmatterSchema, type PostFrontmatter } from "./post-schema"
import { SITE_URL } from "../site"

export interface NewPostInput {
  title: string
  description: string
  date: string
  slug: string
  categories: string[]
  tags: string[]
  experiment?: NonNullable<PostFrontmatter["experiment"]>
}

export function createPostTemplate(input: NewPostInput): string {
  const metadata = postFrontmatterSchema.parse({
    ...input,
    draft: true,
  })

  const experiment = metadata.experiment
    ? `experiment:\n${Object.entries(metadata.experiment)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `  ${key}: ${JSON.stringify(value)}`)
        .join("\n")}\n`
    : ""

  return `---
title: ${JSON.stringify(metadata.title)}
description: ${JSON.stringify(metadata.description)}
date: ${input.date}
slug: ${metadata.slug}
categories: ${JSON.stringify(metadata.categories)}
tags: ${JSON.stringify(metadata.tags)}
draft: true
${experiment}---

## はじめに

この記事で読者が得られることを書きます。

## 本文

内容を書きます。

## まとめ

要点と次のアクションを書きます。
`
}

export function createSocialTemplate(input: {
  title: string
  slug: string
  utmCampaign?: string
}): string {
  const campaign = encodeURIComponent(
    input.utmCampaign ?? `blog_${input.slug.replaceAll("-", "_")}`,
  )
  const articleUrl = `${SITE_URL}/blog/${input.slug}?utm_source=threads&utm_medium=social&utm_campaign=${campaign}`

  return `# SNS告知文

記事: ${input.title}
URL: ${articleUrl}

## Threads

500字以内で告知文を記入します。
`
}
