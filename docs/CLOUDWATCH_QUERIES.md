# CloudWatch Logs Insights クエリサンプル集

このドキュメントでは、エラートラッキングシステムで記録されたログを分析するための、CloudWatch Logs Insightsクエリのサンプルを提供します。

## 基本的な検索

### 1. すべてのエラーを表示（最新順）

```
fields @timestamp, level, error.message, context.url, sessionId
| filter level = "error"
| sort @timestamp desc
| limit 100
```

### 2. 特定の時間範囲のエラー

```
fields @timestamp, error.message, context.url
| filter level = "error" and @timestamp > "2025-12-17T00:00:00Z" and @timestamp < "2025-12-17T23:59:59Z"
| sort @timestamp desc
```

### 3. エラーメッセージで検索

```
fields @timestamp, error.message, error.stack, context.url
| filter error.message like /Cannot read property/
| sort @timestamp desc
```

## エラーグルーピング

### 4. フィンガープリント別にエラーをグルーピング

```
fields @timestamp, @fingerprint, error.message
| filter level = "error"
| stats count() as errorCount by @fingerprint, error.message
| sort errorCount desc
```

### 5. エラータイプ別の統計

```
fields error.type
| filter level = "error"
| stats count() as count by error.type
```

### 6. URL別のエラー発生率

```
fields context.url
| filter level = "error"
| stats count() as errorCount by context.url
| sort errorCount desc
```

## ユーザー分析

### 7. ユーザー別のエラー統計

```
fields @timestamp, user.email, error.message
| filter ispresent(user.email)
| stats count() as errorCount by user.email
| sort errorCount desc
```

### 8. 特定ユーザーのエラー履歴

```
fields @timestamp, error.message, context.url, sessionId
| filter user.email = "user@example.com"
| sort @timestamp desc
```

### 9. 匿名ユーザーのエラー

```
fields @timestamp, error.message, context.url, device.browser.name
| filter not ispresent(user.email)
| sort @timestamp desc
```

## セッション追跡

### 10. セッション別のエラー履歴

```
fields @timestamp, error.message, breadcrumbs
| filter sessionId = "your-session-id"
| sort @timestamp asc
```

### 11. エラーが多発しているセッション

```
fields sessionId, error.message
| filter level = "error"
| stats count() as errorCount by sessionId
| filter errorCount > 5
| sort errorCount desc
```

### 12. セッション時系列でのイベント追跡

```
fields @timestamp, sessionId, breadcrumbs[*].message as events
| filter sessionId = "your-session-id"
| sort @timestamp asc
```

## ブレッドクラム分析

### 13. エラー発生前のユーザー操作を表示

```
fields @timestamp, error.message, breadcrumbs
| filter level = "error" and ispresent(breadcrumbs)
| sort @timestamp desc
| limit 10
```

### 14. 特定のナビゲーションパターンを持つエラー

```
fields @timestamp, error.message, breadcrumbs
| filter breadcrumbs.0.category = "navigation" and breadcrumbs.0.message like /payment/
| sort @timestamp desc
```

### 15. HTTPリクエスト失敗後のエラー

```
fields @timestamp, error.message, breadcrumbs
| filter breadcrumbs.*.category = "http" and breadcrumbs.*.level = "error"
| sort @timestamp desc
```

## デバイス・ブラウザ分析

### 16. ブラウザ別のエラー統計

```
fields device.browser.name, device.browser.version
| filter level = "error"
| stats count() as errorCount by device.browser.name, device.browser.version
| sort errorCount desc
```

### 17. OS別のエラー統計

```
fields device.os.name, device.os.version
| filter level = "error"
| stats count() as errorCount by device.os.name, device.os.version
| sort errorCount desc
```

### 18. モバイルデバイスのエラー

```
fields @timestamp, error.message, device.os.name, device.screen.width
| filter device.screen.width < 768
| sort @timestamp desc
```

### 19. 特定のブラウザバージョンのバグ

```
fields @timestamp, error.message, device.browser.version
| filter device.browser.name = "Chrome" and device.browser.version like /120./
| sort @timestamp desc
```

## パフォーマンス分析

### 20. メモリ使用量が高い時のエラー

```
fields @timestamp, error.message, performance.memory.usedJSHeapSize
| filter ispresent(performance.memory) and performance.memory.usedJSHeapSize > 100000000
| sort performance.memory.usedJSHeapSize desc
```

### 21. ページロード時間とエラーの相関

```
fields @timestamp, error.message, performance.navigation.loadTime
| filter ispresent(performance.navigation)
| stats avg(performance.navigation.loadTime) as avgLoadTime, count() as errorCount by bin(1h)
```

### 22. メモリリークの検出

```
fields @timestamp, sessionId, performance.memory.usedJSHeapSize
| filter ispresent(performance.memory)
| sort sessionId, @timestamp asc
| stats max(performance.memory.usedJSHeapSize) as maxMemory by sessionId
| filter maxMemory > 200000000
| sort maxMemory desc
```

## タグ別分析

### 23. 特定のコンポーネントでのエラー

```
fields @timestamp, error.message, context.tags.component
| filter context.tags.component = "MyComponent"
| sort @timestamp desc
```

### 24. 環境別のエラー統計

```
fields environment
| filter level = "error"
| stats count() as errorCount by environment
```

### 25. リリースバージョン別のエラー

```
fields release
| filter level = "error"
| stats count() as errorCount by release
| sort errorCount desc
```

## トレンド分析

### 26. 時間別エラー発生率（5分間隔）

```
fields @timestamp
| filter level = "error"
| stats count() as errorCount by bin(5m)
| sort bin(5m) asc
```

### 27. 日別エラートレンド

```
fields @timestamp
| filter level = "error"
| stats count() as errorCount by datefloor(@timestamp, 1d) as day
| sort day asc
```

### 28. エラーの急増を検出

```
fields @timestamp
| filter level = "error"
| stats count() as errorCount by bin(10m)
| filter errorCount > 50
| sort bin(10m) desc
```

## 詳細なデバッグ

### 29. エラースタックトレースの全表示

```
fields @timestamp, error.message, error.stack, error.componentStack
| filter level = "error" and @fingerprint = "Error::at handleClick"
| sort @timestamp desc
| limit 1
```

### 30. カスタムコンテキストの検索

```
fields @timestamp, error.message, context.extra
| filter ispresent(context.extra) and context.extra.feature = "payment"
| sort @timestamp desc
```

### 31. 特定URLでの特定エラー

```
fields @timestamp, error.message, error.stack, breadcrumbs
| filter context.url like /checkout/ and error.message like /payment/
| sort @timestamp desc
```

## React特有のエラー

### 32. Reactエラーのみを表示

```
fields @timestamp, error.message, error.componentStack
| filter error.type = "react"
| sort @timestamp desc
```

### 33. コンポーネントスタック付きエラー

```
fields @timestamp, error.message, error.componentStack, context.tags.errorBoundary
| filter ispresent(error.componentStack)
| sort @timestamp desc
```

## アラート用クエリ

### 34. 過去5分間に10回以上発生したエラー

```
fields @fingerprint, error.message
| filter level = "error" and @timestamp > ago(5m)
| stats count() as errorCount by @fingerprint
| filter errorCount >= 10
| sort errorCount desc
```

### 35. 新しいエラータイプの検出

```
fields @fingerprint, error.message
| filter level = "error" and @timestamp > ago(1h)
| stats count() as errorCount by @fingerprint
| filter errorCount = 1
| sort @timestamp desc
```

### 36. エラー率が閾値を超えた場合

```
fields @timestamp
| stats count() as total, sum(level = "error") as errorCount by bin(5m)
| fields bin(5m), errorCount, total, (errorCount / total * 100) as errorRate
| filter errorRate > 5
| sort bin(5m) desc
```

## パフォーマンスクエリ

### 37. 最もクエリが遅いログ検索の最適化

```
# インデックス化されたフィールドを使用
fields @timestamp, @fingerprint, level
| filter level = "error"
| limit 1000
```

### 38. JSON解析なしの高速カウント

```
stats count() by bin(5m)
```

## カスタムダッシュボード用

### 39. エラーサマリー（ダッシュボード用）

```
fields @timestamp
| filter level = "error"
| stats 
    count() as totalErrors,
    count_distinct(sessionId) as affectedSessions,
    count_distinct(@fingerprint) as uniqueErrors,
    count_distinct(user.email) as affectedUsers
```

### 40. リアルタイムエラーモニター

```
fields @timestamp, error.message, context.url, user.email
| filter level = "error" and @timestamp > ago(5m)
| sort @timestamp desc
```

## ヒントとベストプラクティス

### クエリ最適化のコツ

1. **フィルターを早めに適用**: `filter`を最初に使って、処理するデータ量を減らす
2. **インデックス化されたフィールドを使用**: `@timestamp`, `@fingerprint`, `level`など
3. **limit句を追加**: 大量のデータを返す場合は`limit`で制限
4. **時間範囲を指定**: CloudWatch Logs InsightsのUIで時間範囲を絞る

### よく使うフィールド

- `@timestamp`: タイムスタンプ（自動インデックス）
- `@fingerprint`: エラーグルーピング用（カスタムフィールド）
- `level`: エラーレベル（error, warning, info）
- `error.message`: エラーメッセージ
- `error.stack`: スタックトレース
- `context.url`: エラーが発生したURL
- `sessionId`: セッションID
- `user.email`: ユーザーのメールアドレス
- `device.browser.name`: ブラウザ名
- `breadcrumbs`: イベント履歴

## 保存したクエリの管理

CloudWatch Logs Insightsでは、よく使うクエリを保存できます：

1. クエリを実行
2. 「Save」をクリック
3. クエリ名とフォルダを指定
4. 後で「Saved queries」から簡単にアクセス

## アラート設定

重要なエラーパターンには、CloudWatch Alarmsを設定することをおすすめします：

```bash
# 例: 過去5分間にエラーが10回以上発生したらアラート
aws cloudwatch put-metric-alarm \
  --alarm-name "HighErrorRate" \
  --alarm-description "Alert when error rate is high" \
  --metric-name "ErrorCount" \
  --namespace "TentSpace/Frontend" \
  --statistic "Sum" \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator "GreaterThanThreshold"
```

## まとめ

これらのクエリを使用して：
- エラーの傾向を把握
- ユーザー影響を測定
- パフォーマンス問題を特定
- デバッグ情報を収集
- リアルタイムモニタリング

より詳しい情報は、[ERROR_TRACKING.md](./ERROR_TRACKING.md)を参照してください。

