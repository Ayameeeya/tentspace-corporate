Claude Codeのモデル、指定したら固定だと思っていませんか。8月末からのchangelogを追うと、既定モデルはバージョンアップで動きますし、同じ「fable」指定でも経路によって解決先が違う期間があります。無人でRoutineを走らせている身としては、ここが検査の外側にあるのが一番怖い。

2.1.251で入ったPreModelSwitch / PostModelSwitchフックで、モデル切替をブロック・確認・注記できるようになりました。hooksの守備範囲がコマンドからモデル選択へ。私はまず注記モードで発火回数を数えるところから始めます。

固定と検査の2段構えをブログに整理しました。

https://www.tentspace.net/blog/claude-code-model-switch-hooks
