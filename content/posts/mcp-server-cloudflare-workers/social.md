MCPサーバーの自作、難所は「動かすまで」ではなかったです。

公式TypeScript SDK＋Cloudflare Workersなら、最小構成は実質1ファイルと設定1枚で動きます。SNS自動化のサーバーをツール55本まで育てて無人運用してみて、時間を使う価値があったのは逆側。入力スキーマ・Bearer認証・confirm必須・KVの回数制限という「断る側」の設計でした。

最小構成のコードから、運用で効いた設計5つ、ツール表面を固定するテストまでまとめています。

https://www.tentspace.net/blog/mcp-server-cloudflare-workers
