worktreeで並列にした作業の「畳み方」を記事にしました。

「worktree用のマージコマンド」を探すと、答えは「存在しない」です。合流は普通のgit mergeです。worktree特有なのは、どこで実行するかと、どの順番で畳むかの2点だけ。

詰まりやすいのはマージコマンドではなく、lockfileの衝突と合流の順番です。生成物は手で混ぜずに再生成する。小さいタスクから1本ずつ畳んで、1本ごとに残りへmainを取り込む。

コンフリクト解消をClaude Codeに任せるときの指示の型も書きました。鍵は両方のタスクの意図を1行ずつ言語化して渡すことです。

https://www.tentspace.net/blog/claude-code-worktree-merge
