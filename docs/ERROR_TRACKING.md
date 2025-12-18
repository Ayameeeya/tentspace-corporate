# エラートラッキングシステム (Sentryライク)

このプロジェクトには、AWS CloudWatch Logsを使用したSentryライクなエラートラッキングシステムが実装されています。

## 機能

### 1. 自動エラー検出
- **グローバルエラー**: `window.onerror`でキャッチ
- **Promise拒否**: `unhandledrejection`でキャッチ
- **Reactエラー**: `ErrorBoundary`コンポーネントでキャッチ

### 2. Sentryライクな機能
- ✅ **エラーグルーピング**: フィンガープリントによる自動グルーピング
- ✅ **ブレッドクラム**: イベント履歴（ナビゲーション、コンソール、エラー）
- ✅ **タグ**: カスタムタグでフィルタリング
- ✅ **ユーザーコンテキスト**: ユーザー情報の記録
- ✅ **デバイス情報**: ブラウザ、OS、画面サイズ
- ✅ **パフォーマンスメトリクス**: メモリ使用量、ページロード時間
- ✅ **セッション管理**: セッションIDによる追跡
- ✅ **環境管理**: dev/prod環境別のロググループ

### 3. CloudWatch Logs統合
- 日別ログストリーム（例: `client-errors-2025-12-17`）
- 環境別ロググループ（`/tentspace/frontend-errors/dev`, `/tentspace/frontend-errors/prod`）
- 構造化ログ（CloudWatch Logs Insightsで検索可能）

## セットアップ

### 1. 環境変数の設定

`.env.local`に以下を追加：

```bash
# AWS認証情報
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# ロググループ設定（オプション）
CLOUDWATCH_LOG_GROUP_NAME=/tentspace/frontend-errors
CLOUDWATCH_LOG_STREAM_PREFIX=client-errors

# アプリバージョン（オプション）
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. IAMポリシー

CloudWatch Logsへの書き込み権限が必要です：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:PutRetentionPolicy"
      ],
      "Resource": "arn:aws:logs:ap-northeast-1:*:log-group:/tentspace/frontend-errors/*"
    }
  ]
}
```

### 3. アプリケーションへの統合

`app/layout.tsx`に`ClientErrorTracker`を追加：

```tsx
import { ClientErrorTracker } from '@/components/client-error-tracker';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientErrorTracker
          user={{
            id: 'user123',
            email: 'user@example.com',
            username: 'testuser',
          }}
          tags={{
            environment: 'production',
            version: '1.0.0',
          }}
          release="v1.0.0"
        />
        {children}
      </body>
    </html>
  );
}
```

## 使い方

### 1. 自動トラッキング

エラーは自動的にキャプチャされます：

```tsx
// これらは自動的にCloudWatchに送信されます
throw new Error('Something went wrong');
Promise.reject(new Error('Async error'));
```

### 2. 手動ログ送信

```tsx
import { useErrorTracking } from '@/hooks/use-error-tracking';

function MyComponent() {
  const { logError, addBreadcrumb } = useErrorTracking();

  const handleClick = async () => {
    try {
      // ブレッドクラムを追加
      addBreadcrumb({
        category: 'user',
        message: 'Button clicked',
        level: 'info',
        data: { buttonId: 'submit' },
      });

      await riskyOperation();
    } catch (error) {
      // 手動でエラーを送信
      await logError(error as Error, {
        tags: { component: 'MyComponent', action: 'submit' },
        extra: { userId: '123', formData: {...} },
        level: 'error',
      });
    }
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

### 3. Reactエラーバウンダリー

```tsx
import { ErrorBoundary } from '@/components/error-boundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log('Error caught:', error);
      }}
      fallback={<div>エラーが発生しました</div>}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## CloudWatch Logs Insights クエリ例

### 1. エラーをフィンガープリント別にグルーピング

```
fields @timestamp, @fingerprint, @message, error.message, sessionId
| filter level = "error"
| stats count() as errorCount by @fingerprint
| sort errorCount desc
```

### 2. 特定のURLでのエラーを検索

```
fields @timestamp, error.message, context.url, user.email
| filter context.url like /payment/
| sort @timestamp desc
```

### 3. ユーザー別のエラー統計

```
fields @timestamp, user.email, error.message
| filter ispresent(user.email)
| stats count() as errorCount by user.email
| sort errorCount desc
```

### 4. セッション別のエラー追跡

```
fields @timestamp, sessionId, error.message, breadcrumbs
| filter sessionId = "your-session-id"
| sort @timestamp asc
```

### 5. パフォーマンス問題の検出

```
fields @timestamp, performance.memory.usedJSHeapSize, error.message
| filter ispresent(performance.memory)
| filter performance.memory.usedJSHeapSize > 100000000
| sort @timestamp desc
```

### 6. デバイス・ブラウザ別のエラー統計

```
fields @timestamp, device.browser.name, device.os.name, error.message
| stats count() as errorCount by device.browser.name, device.os.name
| sort errorCount desc
```

### 7. エラー率のトレンド分析

```
fields @timestamp
| filter level = "error"
| stats count() as errorCount by bin(5m)
```

### 8. ブレッドクラム付きエラーの詳細調査

```
fields @timestamp, error.message, breadcrumbs[*].message as breadcrumbMessages
| filter ispresent(breadcrumbs)
| sort @timestamp desc
| limit 20
```

## データ構造

CloudWatchに送信されるログの構造：

```typescript
{
  // イベント識別子
  eventId: "1702826400000-abc123",
  level: "error",
  timestamp: "2025-12-17T10:00:00.000Z",
  
  // エラー情報
  error: {
    type: "error" | "unhandledrejection" | "react",
    message: "Something went wrong",
    stack: "Error: Something went wrong\n    at ...",
    componentStack: "in MyComponent\n    in App"
  },
  
  // グルーピング
  fingerprint: "Error::at handleClick",
  
  // コンテキスト
  context: {
    url: "https://example.com/page",
    userAgent: "Mozilla/5.0...",
    tags: { component: "MyComponent" },
    extra: { customData: "..." }
  },
  
  // ユーザー情報
  user: {
    id: "user123",
    email: "user@example.com",
    username: "testuser"
  },
  
  // デバイス情報
  device: {
    browser: { name: "Chrome", version: "120.0" },
    os: { name: "Windows", version: "10.0" },
    screen: { width: 1920, height: 1080 },
    language: "ja-JP",
    timezone: "Asia/Tokyo"
  },
  
  // パフォーマンス
  performance: {
    memory: {
      usedJSHeapSize: 50000000,
      totalJSHeapSize: 60000000,
      jsHeapSizeLimit: 2000000000
    }
  },
  
  // ブレッドクラム（最新10件）
  breadcrumbs: [
    {
      timestamp: "2025-12-17T09:59:50.000Z",
      category: "navigation",
      message: "Navigated to /page",
      level: "info"
    }
  ],
  
  // セッション
  sessionId: "1702826400000-xyz789",
  release: "v1.0.0",
  environment: "production"
}
```

## ベストプラクティス

### 1. サンプリング率の設定
本番環境では高トラフィック時のコスト削減のため、サンプリング率を調整：

```tsx
<ClientErrorTracker
  // 本番環境: 50%, 開発環境: 100%
  sampleRate={process.env.NODE_ENV === 'production' ? 0.5 : 1.0}
/>
```

### 2. PII（個人情報）のフィルタリング
API側で自動的にメールアドレスや電話番号をマスキング：

```typescript
// app/api/error-logging/route.ts
function sanitizeErrorData(data: ErrorLog): ErrorLog {
  // [EMAIL], [PHONE]に自動変換
}
```

### 3. ブレッドクラムの活用
ユーザーアクションを追跡：

```tsx
addBreadcrumb({
  category: 'user',
  message: 'User clicked submit button',
  level: 'info',
  data: { buttonId: 'submit', formValid: true },
});
```

### 4. タグの効果的な使用
検索とフィルタリングのためにタグを活用：

```tsx
logError(error, {
  tags: {
    feature: 'payment',
    severity: 'critical',
    team: 'backend',
  },
});
```

## トラブルシューティング

### エラーが送信されない

1. AWS認証情報を確認：
```bash
echo $AWS_ACCESS_KEY_ID
```

2. APIエンドポイントの動作確認：
```bash
curl http://localhost:3000/api/error-logging
```

3. 開発環境ではコンソールに詳細が出力されます

### CloudWatchでログが見つからない

- ロググループ名を確認：`/tentspace/frontend-errors/dev`または`/tentspace/frontend-errors/prod`
- ログストリーム名を確認：`client-errors-2025-12-17`（日付は当日）
- IAMポリシーを確認

## コスト最適化

1. **サンプリング率の調整**: 高トラフィックの場合は10-50%に設定
2. **ログ保持期間**: 開発環境7日、本番環境30日（自動設定）
3. **ブレッドクラム数の制限**: 最新10件のみCloudWatchに送信
4. **レート制限**: API側でIP別のレート制限を実装（TODO）

## 今後の改善案

- [ ] レート制限の実装（Redis/Memory）
- [ ] ソースマップサポート（スタックトレースの元コード表示）
- [ ] アラート設定（CloudWatch Alarms）
- [ ] ダッシュボード（CloudWatch Dashboard）
- [ ] バッチ送信（複数エラーをまとめて送信）

