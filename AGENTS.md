# AGENTS.md

## プロジェクト概要

Next.js 16 App Router + MDX のコンテンツ・アズ・コードブログ。記事は
`content/posts/<slug>/index.mdx` で管理する。

現在の公開フローは PR → CI（content validation / generated-content drift /
test / typecheck / build）→ 人間によるマージ → Vercel デプロイ。ローカルの
`content-critic` 定義は本リポジトリに置くが、CI critic・content-only
自動マージ・CODEOWNERS は未接続のため、それらが人間によって設定されるまでは
すべての PR を人間がレビューしてマージする。

## コマンド

- 開発: `npm run dev`
- 検証一式: `npm run check`（typecheck + lint + validate-content）
- 記事雛形:
  `npm run new-post -- --slug <slug> --title <title> --description <description> --hook <hook> --target-kw <keyword> --utm-campaign <campaign>`
- 記事検証: `npm run validate-content -- --file <path>`
- 全記事検証と生成物更新: `npm run content:validate`
- テスト: `npm test`
- 本番ビルド: `npm run build`

## コンテンツ規約

- frontmatter は
  `.claude/skills/write-blog/references/frontmatter-spec.md` に厳密準拠する。
  `experiment`（`hook` / `cta` / `targetKw` / `utmCampaign`）は新規記事で必須。
- `cta` の語彙（定義の正は `docs/style-guide.md`）:
  `inquiry`（案件問い合わせ・最優先）/ `app-download` /
  `camp-reservation` / `note-paid`。
- 記事ディレクトリに `social.md`（Threads 告知文ドラフト）を同梱する。
- 文体は `docs/style-guide.md` に従う。
- 画像は `public/` 配下に置き、本文からルート相対パスで参照する。
- 埋め込みは `<YouTube id="..." />` または `<XEmbed url="..." />` を使う。

## ブランチ・PR 規約

- ブランチは Claude Code が `claude/`、Codex が `codex/` プレフィックスを使う。
- `main` への直接 push と force pushを禁止する。
- 1 記事 1 PR。PR 説明に「狙い」「検証する仮説（Notion の仮説ページへの
  リンク）」「実験属性」「セルフチェック結果」を書く。
- 自己マージ・自己承認は禁止。`gh pr merge` と
  `gh pr review --approve` を使わない。
- `draft: false` への変更は、公開準備が完了した記事 PR 内でのみ行う。

## マージ規約

- 自動マージを将来有効化する場合、diff が `content/posts/**` に完全に閉じた
  PR のみに限定する。それ以外はすべて人間レビューとする。
- 憲法層（`facts.md` / `docs/review-rubric.md` / `.github/` / `hooks/` /
  `.claude/settings.json`）は変更を起案できるが、マージは必ず人間が行う。
- CI・自動マージ・所有者規則は既存設定を正とし、エージェントが無断で
  置き換えない。

## 禁止事項

- `facts.md` に載っていない自社サービス情報（料金・仕様・条件）を書かない。
  `facts.md` と矛盾する内容も書かない。
- 未検証の事実を断定しない。事実主張には一次情報を優先して出典を付ける。
- 実在の人物・他社への言及は `docs/style-guide.md` の言及ルールに従う。
- 公開済み記事（`main` にある `content/posts/**`）を指示なく改変しない。
- シークレット・トークン・ローカル環境ファイル・移行元識別子をコミットしない。
- 記事 PR から CI、レビュー規則、所有者規則、hooks、自動マージ設定を変更しない。

## Notion 連携

- 仮説・PDCA ログ、キーワード、勝ちパターンは Notion コネクタで読む。
- 書き込みは、スキルに明記された最小限の操作に限る。
- コネクタが利用できない、または必要な仮説データがない場合は推測で補わず、
  人間へ確認して停止する。

## コンテンツ実装

`npm run content:validate` は frontmatter、全 MDX、内部リンク、ローカル画像を
検証し、`content-manifest.json` と `content-rendered.json` を再生成する。
表示層はこれらの生成物を読み、記事 slug を Supabase 側の反応・コメントと
共有する。

エージェント向け静的配信は `/llms.txt`、`/content-manifest.json`、
`/blog/<slug>/index.md` で提供する。
