Claude Code 2.1.314の新設定、地味に大きい変更だと思っています。

permissions.blockWritesOutsideWorkingDirectories を有効にすると、Write・Edit・NotebookEditの作業ディレクトリ外への書き込みが全権限モードで拒否される。bypassPermissionsでも効く。書き込み境界の根拠を「モードの選び方」から「設定の宣言」へ移せる形です。

ただし公開翌日の検証記事で実測されたのはWrite×bypassの1ケースで、シェル経由の書き込みは記載も実測もまだ無い。そして同じリリースでは、worktree再開とMonitor経由シェルで保護が発火していなかった修正が2件。

設定を足すことと、全経路で発火していることは別の事実。整理して1本にまとめました。
https://www.tentspace.net/blog/claude-code-write-boundary
