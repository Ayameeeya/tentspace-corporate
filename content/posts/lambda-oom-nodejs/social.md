LambdaのOOM、buffer = null では直りません。

犯人は解放漏れではなく、event.bodyで受けた瞬間にファイル全量がヒープに乗る構造。Base64の膨張とZIP化のバッファを足すと、試算で元PDFの約3.3倍が同居します。

鍵は「通過する」と「溜まる」は別物だということ。S3のGetObjectが返すBodyはデータではなく蛇口で、読んだ分しか流れてこない。一方のevent.bodyは満タンのタンクを問答無用で渡される。ストリーム処理が選べるかどうかは、コードの腕前ではなくデータの入口で決まります。

Presigned URLで入口をS3に変えるまでの切り分けを記事にしました。
https://www.tentspace.net/blog/lambda-oom-nodejs
