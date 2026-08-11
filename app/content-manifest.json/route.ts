import manifest from "@/content-manifest.json"

export const dynamic = "force-static"

export function GET() {
  return new Response(`${JSON.stringify(manifest, null, 2)}\n`, {
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  })
}
