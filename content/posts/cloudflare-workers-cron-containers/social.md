Cloudflareの定時バッチ、5分間隔で回してもliteコンテナなら追加課金ゼロで月$5のまま、という試算になりました。

調べる前は「重いバッチはContainers一択」と思っていたんですが、料金を並べたら設計が反転。Workersのcron実行は月1,000万リクエスト枠に対して8,640回=0.1%未満で実質無料です。分け方はWorker単位ではなく「頻度×重さ」でした。高頻度×軽量はWorkers cron、低頻度×重いはContainers。

cron式がUTC基準で9時間ずれる罠、fetch/scheduledが同じWorkerに同居できる話、TinyGo+WASMでWorkers側もGoで書く最小構成まで、コード解説付きでブログにまとめました。

https://www.tentspace.net/blog/cloudflare-workers-cron-containers
