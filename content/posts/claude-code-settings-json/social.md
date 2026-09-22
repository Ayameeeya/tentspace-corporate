Claude Codeのsettings.json、実は1つではなく5層あります。ユーザー、プロジェクト共有、ローカル、管理ポリシー、そしてCLI引数。

優先順位の暗記より効いたのは、「エージェント自身が書き換えられる層はどれか」を数えることでした。「常に許可」を選ぶたびに育つsettings.local.jsonは、放置すると身に覚えのないallowの山になります。

置き場所ごとの優先順位、permissionsなど主要キー、設定ファイル自体の守り方まで整理しました。

https://www.tentspace.net/blog/claude-code-settings-json
