# write-blog Routine

## Schedule

- cron: 毎週水曜日 10:00 JST
- 登録時に Routines UI のタイムゾーンが `Asia/Tokyo` であることを確認する。
  UTC 固定の場合は水曜日 01:00 UTCへ換算する。

## Prompt

```text
まず自分のオープン PR に content-critic の FAIL コメントがあれば、critic-fix スキルで修正する。
その後、write-blog スキルを使って記事を 1 本執筆し、social.md 込みの PR を作成する。
content-critic と必須 CI が通過したら、その記事 PR を自己マージし、MERGED を確認して終了する。
新規記事は最大 1 本。content/posts/ 以外のファイルには触れない。
```

## Tool scope

- Notion コネクタ: 仮説・PDCAログ、キーワード、勝ちパターンの読み取り中心
- リポジトリ: `content/posts/<slug>/**` の作成と検証
- GitHub CLI: `gh pr create`、自分の PR のコメント・チェック読み取り、
  content-only PR の `gh pr merge`
- Web 閲覧: 原則使用しない。追加リサーチは別プロジェクトの責務

## Completion

- critic-fix が必要な場合は最大 2 回で終了し、未解決なら人間へエスカレーション
- 新規記事は 1 本以下
- PR URL、Notion 仮説リンク、experiment、検証結果、マージ結果を最終報告
- content-critic と必須 CI が成功した記事 PR は自己マージまで完了する
- コード・設定を含む PR は自動マージしない
- 自己承認と直接デプロイは行わない

## Registration prerequisites

- `docs/style-guide.md` と `facts.md` を HIRO が承認済みの内容で埋める
- Claude Code から Notion コネクタと GitHub CLIを利用可能にする
- GitHub CLI の認証ユーザーに PR の作成・チェック閲覧・マージ権限を付与する
- GitHub の auto-merge が無効でも、必須 CI 成功後の直接自己マージを許可する
