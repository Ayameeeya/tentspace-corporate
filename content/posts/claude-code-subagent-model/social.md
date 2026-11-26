Claude Codeのサブエージェント、いまどのモデルで動いているか即答できますか。2.1.330のModel routing節に入った2行で、答え方が少し変わりました。

model未指定のagentとforkは、セッションのフォールバック先を引き継いで動く。一方、skillに書いたmodel設定はサブエージェント・fork・compaction・/recapには及ばない。自分で書いた指定は下流へ伝わらず、暗黙のフォールバックは下流まで伝わる、という非対称です。

「skillにmodelを書けば配下も節約」は成り立たない、が今回の読みどころ。効く範囲の整理と、設定を見直す3点をブログにまとめました。
https://www.tentspace.net/blog/claude-code-subagent-model
