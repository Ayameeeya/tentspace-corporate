AIエージェントにSNS投稿を任せたい。でもアクセストークンを直接渡すのは怖い。

で、間にCloudflare WorkersでリモートMCPサーバーを1枚挟みました。トークンはWorkerの外に出さない。書き込みツールはconfirm必須。回数制限はプロンプトじゃなくKVのカウンタで強制。

「守らせたいルールはコードに置く」に落ち着くまでの設計判断を、実装記録として書きました。

https://www.tentspace.net/blog/remote-mcp-server-cloudflare-workers
