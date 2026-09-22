Claude Codeのsettings.json、実は1つではなく5層あります。ユーザー、プロジェクト共有、ローカル、管理ポリシー、そしてCLI引数。

優先順位の暗記より大事なのは、「エージェント自身が書き換えられる層はどれか」を数えることだと考えています。「常に許可」を選ぶと許可ルールがsettings.local.jsonへ保存されていく仕様なので、放置すると身に覚えのないallowが積もります。

置き場所ごとの優先順位、permissionsなど主要キー、設定ファイル自体の守り方まで整理しました。

https://www.tentspace.net/blog/claude-code-settings-json
