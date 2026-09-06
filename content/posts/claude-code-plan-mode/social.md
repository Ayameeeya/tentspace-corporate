Claude Codeのプランモード、「暴走を止める安全装置」として語られがちですが、本体は別だと考えています。

読み取り専用で計画だけ作らせると、存在しないAPIを呼ぼうとしている・ファイルを取り違えている、みたいな方針の誤りがコード変更ゼロの段階で文章になって出てきます。書いた後に直すより一桁安い。

入り方はShift+Tabで切り替え、起動時の--permission-mode plan、settings.jsonでの固定の3つ。禁止の強制は権限設定とhooksの仕事なので、そこの切り分けも含めて使い方をまとめました。

https://www.tentspace.net/blog/claude-code-plan-mode
