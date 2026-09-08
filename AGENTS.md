# AGENTS.md

## プロジェクト概要

Next.js 16 App Router + MDX のコンテンツ・アズ・コードブログ。記事は
`content/posts/<slug>/index.mdx` で管理する。

記事執筆の公開フローは、執筆 → ローカル検証 → `content-critic` の
`RESULT: PASS` → ready PR → 必須 CI（content validation /
generated-content drift / test / typecheck / build）→ 作成エージェントによる
自己マージ → Vercel デプロイまでを一連で自動化する。

## 作業方針（Codex）

- 依頼済みの作業は調査・実装・検証まで進め、結果が変わる不明点だけ質問する。
- 個別規則で事前承認済みの操作を除き、追加承認は外部送信・課金・公開・
  破壊的またはロールバック不能な変更に限る。必要なら成果物を先に用意する。
- 小さく可逆な変更に実装をなぞるテストは足さない。対象を絞って検証し、PR 前は
  変更種別の必須チェックを行う。記事公開フローの明示チェックは省略しない。
- 報告は簡潔にし、変更ファイル・実行チェック・未完了事項を中心にする。
- サブエージェントは明示された場合だけ読み取り作業に使い、編集は並列化せず、
  親には結論と根拠の要約だけを返す。
- スキルが確認や停止の原因になったら `SKILL.md` のパスと行を示し、許可範囲では
  ユーザーの明示指示を優先する。

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
- MDX コンポーネントの記法と使い所は `docs/writing-guide.md` に従う。
- 画像は `public/` 配下に置き、本文からルート相対パスで参照する。
- 埋め込みは `<YouTube id="..." />` または `<XEmbed url="..." />` を使う。

## ブランチ・PR 規約

- ブランチは Claude Code が `claude/`、Codex が `codex/` プレフィックスを使う。
- `main` への直接 push と force pushを禁止する。
- 1 記事 1 PR。PR 説明に「狙い」「検証する仮説（Notion の仮説ページへの
  リンク）」「実験属性」「セルフチェック結果」を書く。
- 記事 PR は `npm run content:validate` 後の `content-manifest.json`、
  `content-rendered.json`、`content/link-card-cache.json` も同梱する。
- 自己承認は禁止。`gh pr review --approve` を使わない。
- diff が対象記事・対応画像・上記生成物に閉じた記事 PR の自己マージを許可する。
- `draft: false` への変更は、公開準備が完了した記事 PR 内でのみ行う。

## マージ規約

- 記事 PR の自己マージを許可する。対象は diff が
  `content/posts/<slug>/**`、`public/blog-assets/<slug>/**` と上記生成物だけに
  閉じ、`content-critic` が `RESULT: PASS`、必須 CI がすべて成功し、未解決の
  レビュー指摘がない PR のみとする。
- 条件を満たした記事 PR は
  `gh pr merge --auto --squash --delete-branch <number>` で自動マージを予約し、
  `MERGED` を確認してから終了する。GitHub の auto-merge が利用できない場合は、
  必須 CI の成功確認後に `gh pr merge --squash --delete-branch <number>` で
  自己マージする。記事 PR のマージに人間の承認は必須としない。
- 記事・対応画像・上記生成物以外を 1 ファイルでも含む PR は自己マージせず、
  人間レビューにエスカレーションする。
- 憲法層（`facts.md` / `docs/review-rubric.md` / `.github/` / `hooks/` /
  `.claude/settings.json`）は変更を起案できるが、マージは必ず人間が行う。
- CI・所有者規則は既存設定を正とし、エージェントが無断で置き換えない。

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
