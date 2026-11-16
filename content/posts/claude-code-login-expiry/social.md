Claude Codeのサインイン失効、落ちてから気づいていませんか。

期限は claude auth status の loginExpiresAt と、claude -p のJSONに入る credential_expires_at で事前に読めます。ただし警告はstderrに1行だけ。JSON出力には出ないので、スケジュール実行には届きません。

しかもこの値、実際の失効より最大3日遅い側。しきい値は手前に置く設計をブログにまとめました。

https://www.tentspace.net/blog/claude-code-login-expiry
