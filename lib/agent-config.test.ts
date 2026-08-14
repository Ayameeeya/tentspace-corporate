import { readFile } from "node:fs/promises"
import { spawnSync } from "node:child_process"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

async function read(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8")
}

describe("project agent configuration", () => {
  it("AGENTS.mdを単一ソースとしてClaude Codeから参照する", async () => {
    await expect(read("CLAUDE.md")).resolves.toBe("@AGENTS.md\n")
    await expect(read("AGENTS.md")).resolves.toContain("## コンテンツ規約")
  })

  it("仕様で必須のClaude Code資産が揃っている", async () => {
    const requiredFiles = [
      ".claude/skills/write-blog/SKILL.md",
      ".claude/skills/write-blog/references/frontmatter-spec.md",
      ".claude/skills/critic-fix/SKILL.md",
      ".claude/settings.json",
      ".claude/agents/content-critic.md",
      ".claude/agents/proofreader.md",
      "hooks/guard-bash.sh",
      "hooks/validate-on-edit.sh",
      "docs/routines/write-blog.md",
      "docs/style-guide.md",
      "docs/review-rubric.md",
      "facts.md",
      "eslint.config.mjs",
    ]

    await Promise.all(
      requiredFiles.map(async (file) => {
        await expect(read(file), file).resolves.toBeTruthy()
      }),
    )
  })

  it("スキルの発火条件とcritic修正の上限を定義する", async () => {
    const writeBlog = await read(".claude/skills/write-blog/SKILL.md")
    const criticFix = await read(".claude/skills/critic-fix/SKILL.md")

    expect(writeBlog).toContain("name: write-blog")
    expect(writeBlog).toContain("content/posts/")
    expect(writeBlog).toContain("social.md")
    expect(writeBlog).toContain("最大 1 本")
    expect(criticFix).toContain("name: critic-fix")
    expect(criticFix).toMatch(/最大\s*2\s*回/)
    expect(criticFix).toContain("エスカレーション")
  })

  it("Claude Codeフックがガード・即時検証・停止時checkを接続する", async () => {
    const settings = JSON.parse(await read(".claude/settings.json"))

    expect(settings.hooks.PreToolUse[0]).toMatchObject({ matcher: "Bash" })
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toContain(
      "hooks/guard-bash.sh",
    )
    expect(settings.hooks.PostToolUse[0]).toMatchObject({
      matcher: "Write|Edit",
    })
    expect(settings.hooks.PostToolUse[0].hooks[0].command).toContain(
      "hooks/validate-on-edit.sh",
    )
    expect(settings.hooks.Stop[0].hooks[0].command).toContain("npm run check")
  })

  it.each([
    "gh pr merge 123",
    "gh pr review --approve 123",
    "git push origin main",
    "git push --force origin feature/test",
    "wrangler deploy",
    "cat .env.local",
  ])("危険なBashコマンドを拒否する: %s", (command) => {
    const result = spawnSync("bash", [path.join(root, "hooks/guard-bash.sh")], {
      cwd: root,
      input: JSON.stringify({ tool_input: { command } }),
      encoding: "utf8",
    })

    expect(result.status).toBe(2)
    expect(result.stderr.trim()).not.toBe("")
  })

  it("通常のBashコマンドは許可する", () => {
    const result = spawnSync("bash", [path.join(root, "hooks/guard-bash.sh")], {
      cwd: root,
      input: JSON.stringify({ tool_input: { command: "npm test" } }),
      encoding: "utf8",
    })

    expect(result.status).toBe(0)
  })

  it("content-criticを読み取り専用かつfail-closedにする", async () => {
    const critic = await read(".claude/agents/content-critic.md")

    expect(critic).toContain("tools: Read, Grep, Glob")
    expect(critic).toContain("RESULT: PASS")
    expect(critic).toContain("FAIL")
    expect(critic).toContain("判定に迷う場合は FAIL")
  })

  it("npm scriptsがフックから呼ぶ互換コマンドを提供する", async () => {
    const packageJson = JSON.parse(await read("package.json"))

    expect(packageJson.scripts).toMatchObject({
      check: expect.stringContaining("typecheck"),
      "new-post": expect.stringContaining("scripts/new-post.ts"),
      "validate-content": expect.stringContaining("scripts/validate-content.ts"),
    })
    expect(packageJson.scripts.check).toContain("lint")
    expect(packageJson.scripts.check).toContain("validate-content")
    expect(packageJson.devDependencies).toMatchObject({
      eslint: expect.any(String),
      "eslint-config-next": expect.any(String),
    })
  })
})
