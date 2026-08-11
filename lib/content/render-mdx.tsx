import { evaluate } from "@mdx-js/mdx"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import * as runtime from "react/jsx-runtime"
import remarkGfm from "remark-gfm"

function YouTube({ id, title = "YouTube video" }: { id: string; title?: string }) {
  if (!/^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
    throw new Error("Invalid YouTube video id")
  }

  return (
    <div className="video-embed">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function XEmbed({ url }: { url: string }) {
  return (
    <blockquote className="twitter-tweet">
      <a href={url}>{url}</a>
    </blockquote>
  )
}

export async function renderMdxToHtml(source: string): Promise<string> {
  const evaluated = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
  })

  let html = renderToStaticMarkup(
    React.createElement(evaluated.default, {
      components: { YouTube, XEmbed },
    }),
  )

  html = html.replace(
    /<pre><code class="language-([^"\s]+)">/g,
    '<pre class="ts-code" data-lang="$1"><code class="language-$1">',
  )

  return html
}
