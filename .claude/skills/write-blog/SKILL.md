---
name: write-blog
description: ブログ記事（MDX）の執筆に関わる作業では必ずこのスキルを使う。「記事を書いて」「ブログを更新」「◯◯について書く」「今週の記事」「下書きを作って」など、content/posts/ 配下に新しい投稿を作る・書き直すあらゆる作業が対象。題材や仮説が指定されていない場合の選定手順も含む。
---

# Write Blog

新規記事を 1 本だけ設計・執筆し、レビュー可能な content-only PR にする。
執筆文脈はメインループに保持し、レビュー判定は `content-critic` に分離する。

## 事前確認

1. `AGENTS.md`、`facts.md`、`docs/style-guide.md`、
   `references/frontmatter-spec.md` を読む。
2. 現在のブランチと差分を確認する。既存のユーザー変更へ混ぜない。
3. Notion コネクタで次を読み取る。
   - 仮説・PDCA ログ: `status=open`
   - キーワード
   - 勝ちパターン
4. Notion に接続できない、または記事に必要な仮説・事実が不足する場合は、
   推測で埋めず人間へ不足項目を伝えて停止する。

## 1. 入力の取得

題材が指定されていない場合は、次の優先順位で 1 件を選ぶ。

1. open 仮説に紐づく題材
2. `priority=high` のキーワード
3. `last_researched` が新しい題材

選定した Notion ページの URL を控え、PR の仮説リンクに使う。

## 2. 記事設計

執筆前に次を決める。

- `targetKw`: 主検索語
- 想定読者と検索意図
- `cta`: `AGENTS.md` の語彙から選択。指定がなければ `inquiry`
- `hook`: `question` / `number` / `contrarian` / `story` / `howto`
- `utmCampaign`: 仮説と追跡できる一意のキャンペーン名

これらを frontmatter の `experiment` にすべて反映する。

## 3. 執筆

1. `claude/<slug>` ブランチを作る。`main` へ直接 push しない。
2. 次のコマンドで雛形を作る。

   ```bash
   npm run new-post -- \
     --slug <slug> \
     --title "<title>" \
     --description "<description>" \
     --categories "<category>" \
     --tags "<tag1>,<tag2>" \
     --hook <hook> \
     --cta <cta> \
     --target-kw "<targetKw>" \
     --utm-campaign <utmCampaign>
   ```

3. `content/posts/<slug>/index.mdx` を執筆する。
4. 自社情報は `facts.md` に明記された内容だけを使う。
5. 外部の事実主張には出典リンクを付ける。一次情報を優先する。
6. `docs/style-guide.md` の構成・語調・言及ルールを守る。

公開済み記事を指示なく書き直してはならない。新規記事は最大 1 本とする。

## 4. social.md

同じ記事ディレクトリの `social.md` に Threads 告知文を作る。

- 本文は 500 字以内
- 読者が得る価値を先に書く
- 記事リンクには `utm_source=threads`、`utm_medium=social`、
  frontmatter と同じ `utm_campaign` を付ける
- 未検証の効果や数値を足さない

## 5. セルフチェック

1. `npm run validate-content -- --file content/posts/<slug>/index.mdx`
2. `npm run check`
3. 内部リンクと画像が有効
4. `facts.md` と矛盾せず、未掲載の自社情報がない
5. `docs/style-guide.md` に準拠
6. frontmatter の `experiment` が全項目を持つ
7. 差分が `content/posts/<slug>/**` に閉じている

失敗を修正し、すべて通るまで PR を作らない。

## 6. PR 作成

PR 本文は次の構成にする。

```markdown
## 狙い

## 検証する仮説
- Notion: <URL>

## 実験属性
- targetKw:
- hook:
- cta:
- utmCampaign:

## セルフチェック
- [ ] validate-content
- [ ] npm run check
- [ ] facts / style-guide
- [ ] content/posts/ 内だけの差分
```

`gh pr create` まで行い、PR URL と検証結果を報告して終了する。自己承認・
自己マージは行わない。

## 書かないこと

- 公開済み記事の無断改変
- `content/posts/<slug>/` 外の変更
- `facts.md` にない自社情報
- 出典のない事実断定
- 2 本目の記事
