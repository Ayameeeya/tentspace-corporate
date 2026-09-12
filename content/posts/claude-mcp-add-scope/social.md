claude mcp add の --scope、3スコープ=3ファイルだと思っていませんか。

実測すると、localとuserは同じ ~/.claude.json に同居していて、リポジトリ側にあるのは .mcp.json だけ。さらに同名サーバーの優先順位は local > project > user のはずが、承認前のprojectサーバーは順位表にすら載らず、user設定が使われ続けます。

「addしたのに繋がらない」「消したのに残ってる」を3分で切り分ける手順まで、保存先と優先順位の実測ログ付きで整理しました。

https://www.tentspace.net/blog/claude-mcp-add-scope
