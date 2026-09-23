Claude Codeの中身は、切り出して自分のコードから呼べます。名前はClaude Agent SDK。エージェントループ、ツール実行、コンテキスト管理、権限制御までCLIと同じ部品が入っていて、ループの自作から始める必要がなくなります。

つまずきやすいのは、既定ではCLAUDE.mdもsettings.jsonも読まないこと。Claude Codeと同じ動きを期待して移ると、まずここで戸惑うはずです。

Messages APIとの違い、TypeScriptの最小構成、権限設計の考え方、CLI・headlessモードとの使い分けの境界線まで整理しました。

https://www.tentspace.net/blog/claude-agent-sdk
