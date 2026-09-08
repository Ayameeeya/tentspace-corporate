Claude Codeを2つ同時に走らせるなら、タブを増やすより先にgit worktreeです。

同じディレクトリで2セッション動かすと、編集・git操作・テスト結果が混線します。worktreeでタスクごとに作業ツリーを切れば、履歴は共有したままファイル編集は互いに影響しなくなり、「同じブランチの二重チェックアウトをgitが拒否する」制約がそのまま安全装置になります。

手順は add→cd→claude の3ステップ。ただし依存や.envはworktreeに引き継がれないので、そこのセットアップと「並列の上限は自分のレビュー帯域」という話まで含めてブログに整理しました。

https://www.tentspace.net/blog/claude-code-git-worktree-parallel
