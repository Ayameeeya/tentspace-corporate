MCPサーバーを自作するとき、toolsしか使っていないことに引け目を感じる必要はないと思っています。

仕様にはtools・resources・promptsの3つがあって、違いは機能ではなく「誰が起動を決めるか」。toolsはモデル、resourcesはアプリ、promptsはユーザーです。

教科書どおり「読み取り専用はresources」と分けると、無人運用では止まります。資料を@メンションで選んでくれる人がいないので、エージェントが自分で取りに行く経路、つまりtoolsが要る。クライアント側の対応表を見ても、tools対応がいちばん広い。

「全部tools」は数えた結果なら設計判断。使い分けの決め方を1本にまとめました。
https://www.tentspace.net/blog/mcp-tools-resources-prompts
