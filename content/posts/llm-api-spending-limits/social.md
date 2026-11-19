LLMコストの監視で/costの数字が急に跳ねたら、まず事故を疑いますよね。Claude Code 2.1.325では、modのモデル呼び出しが/costと--max-budget-usdの集計に入りました。費用が増えたのではなく、数え方が増えた。時系列には無言で段差がつきます。

数える側の定義はこうやって動くので、観測だけでは支出は守れません。実行単位の--max-budget-usdと、Cloudflareが11月に出したアカウント単位のSpend Management。「数える」と「止める」を別の層に置く二段構えをブログに整理しました。
https://www.tentspace.net/blog/llm-api-spending-limits
