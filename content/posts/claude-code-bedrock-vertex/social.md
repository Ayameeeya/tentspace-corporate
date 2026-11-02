Claude Codeを会社に入れるとき、最初に詰まるのはモデルの性能ではなく「APIキーを誰が管理するか」だと思っています。

これ、接続先の切替でだいぶ消せます。CLAUDE_CODE_USE_BEDROCK=1 でAmazon Bedrock経由、Vertex AIも同様。配る鍵が無くなって、認証も請求も既存のクラウド統制に載る形。

ただし切替は数行でも、本体は認証に寿命が生まれること。SSOやADCのセッションは切れるので、無人運用やCIは「認証をどう更新し続けるか」の設計が要ります。鍵を配らない構成は、期限切れが仕様になる構成でもある。

手順と判断基準を1本にまとめました。
https://www.tentspace.net/blog/claude-code-bedrock-vertex
