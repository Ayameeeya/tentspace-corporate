---
name: critic-fix
description: content-critic が FAIL コメントを付けた PR を修正するときは必ずこのスキルを使う。「critic に落ちた」「レビュー指摘の修正」「PR のチェックが赤い」等が対象。
---

# Critic Fix

content-critic の FAIL を同じ記事 PR 内で安全に修正する。修正試行は最大 2 回。
3 回目が必要なら人間へエスカレーションして停止する。

## 手順

1. `gh pr status` で自分のオープン PR を特定する。
2. `gh pr view <number> --comments` とチェックログから最新の
   `RESULT: FAIL` を取得する。
3. PR コメントまたはコミット履歴の `critic-fix attempt: N/2` を数える。
   すでに 2 回なら修正せず、エスカレーション手順へ進む。
4. 指摘を分類する。
   - 事実・出典
   - `facts.md` との矛盾または未掲載情報
   - 文体・人物や他社への言及
   - frontmatter・MDX スキーマ
5. `docs/review-rubric.md`、`facts.md`、`docs/style-guide.md` を読み、
   指摘された記事だけを最小修正する。
6. `npm run validate-content -- --file <article-path>` と `npm run check` を行う。
7. `critic-fix attempt: N/2` を含むコミットを同じ PR へ push する。

## PASS 後の自己マージ

修正後に `content-critic` が `RESULT: PASS` となったら、次を行う。

1. `gh pr diff <number> --name-only` で差分が `content/posts/**` のみに閉じて
   いることを確認する。混在差分なら人間へエスカレーションして停止する。
2. `gh pr checks <number> --watch` で必須チェックの成功を確認する。
3. 未解決指摘がないことを確認し、次で自己マージを予約する。

   ```bash
   gh pr merge --auto --squash --delete-branch <number>
   ```

4. GitHub の auto-merge が利用できない場合は、全必須チェック成功後に
   `gh pr merge --squash --delete-branch <number>` で自己マージする。
5. PR の状態が `MERGED` になったことを確認して終了する。

## エスカレーション

2 回修正しても FAIL の場合は、次の PR コメントを残して停止する。

```markdown
critic-fix escalation

- Attempts: 2/2
- Remaining findings: <未解決の指摘>
- Human decision needed: <判断が必要な点>
```

FAIL のまま自己マージせず、自己承認も行わない。critic 指摘を避けるために
`facts.md`、rubric、CI、hooks を変更しない。
