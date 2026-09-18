Claude CodeのGitHub Actions連携、「CIにAIを足す」話だと思って整理したら、本体は承認の反転でした。

対話モードなら危ない操作は自分が承認します。Actionsでは、@claudeを書き込んだ瞬間にワークフローの権限のまま最後まで走る。つまり、メンションを書ける人の集合がそのまま承認者の集合になります。

最小のワークフロー設定、promptを渡す自動実行、素のclaude -pとの使い分けまで整理しました。

https://www.tentspace.net/blog/claude-code-github-actions
