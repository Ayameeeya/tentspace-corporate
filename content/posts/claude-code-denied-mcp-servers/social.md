Claude CodeのMCPサーバー拒否設定、名前（serverName）で書いた行は「一覧から消す」だけで、実行を止める統制ではありませんでした。

2.1.330からは名前指定が指定したコネクタだけを隠す挙動に変わり、同じURLの別コネクタは隠れません。ドキュメント側も「serverNameはセキュリティ制御ではない」と明記。止めたいならserverUrlかserverCommandで書く側です。

設定ファイルを変えていなくても、版を上げると拒否の実効範囲が狭くなる変更。名前・URL・コマンドの3分類で棚卸しする手順をブログに書きました。
https://www.tentspace.net/blog/claude-code-denied-mcp-servers
