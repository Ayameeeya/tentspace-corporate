「既存のREST APIをMCPツール化するのに、もうサーバーを書かなくていい」。Google Cloud API GatewayのMCP対応（Public Preview）で、OpenAPIに注釈を2種類足すだけで既存のoperationがエージェント向けツールになります。

自作MCPサーバーをツール55本まで手書きしてきた側から見ると、これは半分だけ正しい話です。生成で消えるのは「ツールを生やす」層。手書きで本当に時間を使ったのは、confirm必須や回数上限といった「断る側」で、その層は生成されません。

制約（OpenAPI 2.0非対応・204は露出されない・1,000ツール上限）と、どちらから始めるかの判断基準をブログに整理しました。

https://www.tentspace.net/blog/rest-api-mcp-tools
