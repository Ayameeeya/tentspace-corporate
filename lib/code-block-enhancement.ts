import type { HLJSApi } from "highlight.js"

const LANGUAGE_NAMES: Record<string, string> = {
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  ts: "TypeScript",
  python: "Python",
  py: "Python",
  java: "Java",
  csharp: "C#",
  cs: "C#",
  cpp: "C++",
  c: "C",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  scala: "Scala",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sass: "Sass",
  less: "Less",
  json: "JSON",
  xml: "XML",
  yaml: "YAML",
  yml: "YAML",
  markdown: "Markdown",
  md: "Markdown",
  sql: "SQL",
  bash: "Bash",
  shell: "Shell",
  sh: "Shell",
  powershell: "PowerShell",
  ps1: "PowerShell",
  dockerfile: "Dockerfile",
  docker: "Docker",
  nginx: "Nginx",
  apache: "Apache",
  graphql: "GraphQL",
  vue: "Vue",
  react: "React",
  jsx: "JSX",
  tsx: "TSX",
  dart: "Dart",
  r: "R",
  matlab: "MATLAB",
  perl: "Perl",
  lua: "Lua",
  haskell: "Haskell",
  elixir: "Elixir",
  erlang: "Erlang",
  clojure: "Clojure",
  text: "Text",
  plaintext: "Plain Text",
}

function cleanCodeText(text: string): string {
  const lines = text.split("\n")
  while (lines.length > 0 && lines[0].trim() === "") lines.shift()
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop()
  return lines.join("\n")
}

function createCopyButton(code: string): HTMLButtonElement {
  const copyButton = document.createElement("button")
  copyButton.type = "button"
  copyButton.className = "ts-code-copy"
  copyButton.setAttribute("aria-label", "コードをコピー")
  copyButton.innerHTML = `
    <svg class="copy-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
    <svg class="check-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span class="copy-text">コピー</span>
  `
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code)
      const copyIcon = copyButton.querySelector<HTMLElement>(".copy-icon")
      const checkIcon = copyButton.querySelector<HTMLElement>(".check-icon")
      const copyText = copyButton.querySelector<HTMLElement>(".copy-text")
      if (!copyIcon || !checkIcon || !copyText) return

      copyIcon.style.display = "none"
      checkIcon.style.display = "block"
      copyText.textContent = "コピー完了!"
      copyButton.setAttribute("aria-label", "コピー完了")
      copyButton.classList.add("copied")

      setTimeout(() => {
        copyIcon.style.display = "block"
        checkIcon.style.display = "none"
        copyText.textContent = "コピー"
        copyButton.setAttribute("aria-label", "コードをコピー")
        copyButton.classList.remove("copied")
      }, 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  })
  return copyButton
}

function enhanceCodeBlock(pre: HTMLPreElement, highlighter: HLJSApi): void {
  if (pre.classList.contains("enhanced") || !pre.parentNode) return

  const language = pre.dataset.lang || "text"
  const title = pre.dataset.title || ""
  const codeElement = pre.querySelector<HTMLElement>("code")
  const temporaryCode = codeElement?.cloneNode(true) as HTMLElement | undefined
  if (temporaryCode) {
    temporaryCode.innerHTML = temporaryCode.innerHTML.replace(/<br\s*\/?>/gi, "\n")
  }
  const code = cleanCodeText(temporaryCode?.textContent || "")

  const wrapper = document.createElement("div")
  wrapper.className = "ts-code-wrapper"
  const header = document.createElement("div")
  header.className = "ts-code-header"
  const languageBadge = document.createElement("span")
  languageBadge.className = "ts-code-lang"
  languageBadge.textContent = LANGUAGE_NAMES[language.toLowerCase()] || language.toUpperCase()
  header.appendChild(languageBadge)

  if (title) {
    const titleElement = document.createElement("span")
    titleElement.className = "ts-code-title"
    titleElement.textContent = title
    header.appendChild(titleElement)
  }
  header.appendChild(createCopyButton(code))

  pre.parentNode.insertBefore(wrapper, pre)
  wrapper.append(header, pre)
  pre.dataset.language = language.toLowerCase()
  pre.classList.add("enhanced")

  if (!codeElement) return
  codeElement.textContent = code
  try {
    const normalizedLanguage = language.toLowerCase()
    const result = highlighter.getLanguage(normalizedLanguage)
      ? highlighter.highlight(code, { language: normalizedLanguage })
      : highlighter.highlightAuto(code)
    codeElement.innerHTML = result.value
    codeElement.classList.add("hljs")
  } catch (error) {
    console.warn(`Highlight.js failed for language: ${language.toLowerCase()}`, error)
    codeElement.textContent = code
  }
}

export async function loadCodeHighlighter(): Promise<HLJSApi> {
  const { default: highlighter } = await import("highlight.js/lib/core")
  const languages = await Promise.all([
    import("highlight.js/lib/languages/javascript"),
    import("highlight.js/lib/languages/typescript"),
    import("highlight.js/lib/languages/python"),
    import("highlight.js/lib/languages/go"),
    import("highlight.js/lib/languages/rust"),
    import("highlight.js/lib/languages/java"),
    import("highlight.js/lib/languages/kotlin"),
    import("highlight.js/lib/languages/swift"),
    import("highlight.js/lib/languages/php"),
    import("highlight.js/lib/languages/ruby"),
    import("highlight.js/lib/languages/bash"),
    import("highlight.js/lib/languages/json"),
    import("highlight.js/lib/languages/yaml"),
    import("highlight.js/lib/languages/sql"),
    import("highlight.js/lib/languages/css"),
    import("highlight.js/lib/languages/scss"),
    import("highlight.js/lib/languages/xml"),
    import("highlight.js/lib/languages/csharp"),
    import("highlight.js/lib/languages/c"),
    import("highlight.js/lib/languages/cpp"),
    import("highlight.js/lib/languages/dockerfile"),
    import("highlight.js/lib/languages/graphql"),
  ])
  const aliases = [
    ["javascript", "js"],
    ["typescript", "ts"],
    ["python", "py"],
    ["go"],
    ["rust"],
    ["java"],
    ["kotlin"],
    ["swift"],
    ["php"],
    ["ruby"],
    ["bash", "shell", "sh"],
    ["json"],
    ["yaml", "yml"],
    ["sql"],
    ["css"],
    ["scss"],
    ["html", "xml"],
    ["csharp", "cs"],
    ["c"],
    ["cpp"],
    ["dockerfile", "docker"],
    ["graphql"],
  ]
  aliases.forEach((names, index) => {
    for (const name of names) highlighter.registerLanguage(name, languages[index].default)
  })
  return highlighter
}

export async function enhanceCodeBlocks(
  container: HTMLElement,
  loadHighlighter: () => Promise<HLJSApi> = loadCodeHighlighter,
  isCancelled: () => boolean = () => false,
): Promise<void> {
  if (!container.querySelector("pre.ts-code:not(.enhanced)")) return

  const highlighter = await loadHighlighter()
  if (isCancelled()) return

  container
    .querySelectorAll<HTMLPreElement>("pre.ts-code:not(.enhanced)")
    .forEach((pre) => enhanceCodeBlock(pre, highlighter))
}
