import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { describe, expect, it } from "vitest"

describe("content CI workflow", () => {
  it("validate・test・typecheck・buildを必須実行する", async () => {
    const workflowPath = path.join(
      process.cwd(),
      ".github",
      "workflows",
      "ci.yml",
    )
    expect(existsSync(workflowPath), "ci.yml must exist").toBe(true)
    if (!existsSync(workflowPath)) return

    const workflow = await readFile(workflowPath, "utf8")
    expect(workflow).toContain("npm run content:validate")
    expect(workflow).toContain("npm test")
    expect(workflow).toContain("npm run typecheck")
    expect(workflow).toContain("npm run build")
  })

  it("Next.jsビルドで型エラーを無視しない", async () => {
    const config = await readFile(
      path.join(process.cwd(), "next.config.mjs"),
      "utf8",
    )
    expect(config).not.toContain("ignoreBuildErrors")
  })
})
