# エラートラッキングシステム 実装サマリー

## 概要

SentryライクなエラートラッキングシステムをAWS CloudWatch Logsを使用して実装しました。

## 実装したファイル

### 1. コアシステム

#### `hooks/use-error-tracking.ts`
拡張されたエラートラッキングフック

**主な機能:**
- 自動エラー検出（JavaScript、Promise拒否）
- ブレッドクラム管理（最大50件）
- デバイス・ブラウザ情報の自動取得
- パフォーマンスメトリクスの収集
- エラーフィンガープリント生成
- セッション管理
- 手動エラーログ送信

**エクスポート:**
```typescript
- useErrorTracking(options): { logError, addBreadcrumb }
- addBreadcrumb(breadcrumb): void
- 型定義: ErrorInfo, Breadcrumb, UserContext, DeviceContext
```

#### `components/error-boundary.tsx`
Reactエラーバウンダリー（拡張版）

**機能:**
- Reactコンポーネントエラーのキャッチ
- CloudWatchへの自動送信
- エラーフィンガープリント生成
- デバイス・パフォーマンス情報の収集
- カスタムフォールバックUI

#### `components/client-error-tracker.tsx`
クライアント側エラートラッキングコンポーネント

**機能:**
- グローバルエラートラッキングの設定
- ユーザーコンテキストの設定
- グローバルタグの設定
- HTTPリクエスト自動追跡の統合
- サンプリング率の設定

### 2. ユーティリティ

#### `lib/fetch-interceptor.ts`
Fetch APIインターセプター

**機能:**
- すべてのHTTPリクエストを自動追跡
- リクエスト/レスポンスのメトリクス収集
- エラーの自動ブレッドクラム追加
- 特定URLの除外設定
- リクエスト時間の計測

### 3. API

#### `app/api/error-logging/route.ts`
CloudWatch Logsへの送信API

**機能:**
- 構造化ログの生成
- イベントID生成（Sentryライク）
- PIIフィルタリング（メール、電話番号）
- 環境別ロググループ管理
- 日別ログストリーム自動作成
- ログ保持期間の自動設定
- ヘルスチェックエンドポイント

**エンドポイント:**
- `POST /api/error-logging` - エラーログ送信
- `GET /api/error-logging` - ヘルスチェック

### 4. デモ・ドキュメント

#### `components/error-tracking-demo.tsx`
エラートラッキングのデモコンポーネント

**デモ機能:**
1. JavaScriptエラーのトリガー
2. Promise拒否のトリガー
3. 手動ログ送信
4. ユーザーコンテキスト付きエラー
5. ユーザーフローのシミュレート（ブレッドクラム4件）
6. APIステータス確認

#### `docs/ERROR_TRACKING.md`
完全なドキュメント

**内容:**
- セットアップ手順
- 使い方
- CloudWatch Logs Insightsクエリ例
- データ構造
- ベストプラクティス
- トラブルシューティング

#### `docs/CLOUDWATCH_QUERIES.md`
CloudWatch Logs Insightsクエリ集

**40以上のクエリサンプル:**
- 基本的な検索
- エラーグルーピング
- ユーザー分析
- セッション追跡
- ブレッドクラム分析
- デバイス・ブラウザ分析
- パフォーマンス分析
- トレンド分析
- アラート用クエリ

#### `README.md`
プロジェクトREADME

**内容:**
- クイックスタート
- セットアップ手順
- 使い方の例
- トラブルシューティング

## データフロー

```
1. エラー発生
   ↓
2. エラー検出
   - JavaScript: window.onerror
   - Promise: unhandledrejection
   - React: ErrorBoundary
   ↓
3. エラー情報の拡張
   - フィンガープリント生成
   - ブレッドクラム追加
   - デバイス情報収集
   - パフォーマンスメトリクス収集
   ↓
4. sendBeacon/fetch でAPI送信
   ↓
5. API側での処理
   - PIIフィルタリング
   - 構造化ログ生成
   - イベントID生成
   ↓
6. CloudWatch Logsへ送信
   - ロググループ: /tentspace/frontend-errors/{env}
   - ログストリーム: client-errors-YYYY-MM-DD
   ↓
7. CloudWatch Logs Insightsで分析
```

## 主な型定義

### ErrorInfo

```typescript
interface ErrorInfo {
  // 基本情報
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  type: 'error' | 'unhandledrejection' | 'react';
  componentStack?: string;
  severity: 'error' | 'warning' | 'info';
  
  // Sentryライクな追加情報
  fingerprint?: string[];
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  breadcrumbs?: Breadcrumb[];
  user?: UserContext;
  device?: DeviceContext;
  performance?: PerformanceMetrics;
  
  // セッション情報
  sessionId?: string;
  release?: string;
  environment?: string;
}
```

### Breadcrumb

```typescript
interface Breadcrumb {
  timestamp: string;
  category: 'navigation' | 'console' | 'http' | 'user' | 'error';
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}
```

## CloudWatch Logs構造

### ロググループ階層

```
/tentspace/frontend-errors/
├── dev/                    (開発環境、7日間保持)
│   ├── client-errors-2025-12-17
│   ├── client-errors-2025-12-18
│   └── ...
└── prod/                   (本番環境、30日間保持)
    ├── client-errors-2025-12-17
    ├── client-errors-2025-12-18
    └── ...
```

### ログエントリ構造

```json
{
  "eventId": "1702826400000-abc123",
  "level": "error",
  "timestamp": "2025-12-17T10:00:00.000Z",
  "fingerprint": "Error::at handleClick",
  
  "error": {
    "type": "error",
    "message": "Something went wrong",
    "stack": "Error: ...",
    "componentStack": "in MyComponent..."
  },
  
  "context": {
    "url": "https://example.com/page",
    "tags": { "component": "MyComponent" },
    "extra": { "customData": "..." }
  },
  
  "user": {
    "id": "user123",
    "email": "user@example.com"
  },
  
  "device": {
    "browser": { "name": "Chrome", "version": "120.0" },
    "os": { "name": "Windows", "version": "10.0" }
  },
  
  "breadcrumbs": [
    {
      "timestamp": "2025-12-17T09:59:50Z",
      "category": "navigation",
      "message": "Navigated to /page"
    }
  ],
  
  "sessionId": "1702826400000-xyz789",
  "release": "v1.0.0",
  "environment": "production",
  
  "@message": "[ERROR] error: Something went wrong",
  "@fingerprint": "Error::at handleClick"
}
```

## 設定ファイル

### 環境変数 (.env.local)

```bash
# AWS認証情報（必須）
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# CloudWatch設定（オプション）
CLOUDWATCH_LOG_GROUP_NAME=/tentspace/frontend-errors
CLOUDWATCH_LOG_STREAM_PREFIX=client-errors

# アプリバージョン（オプション）
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### IAMポリシー

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

## パフォーマンス最適化

### サンプリング

```typescript
// 本番環境では50%サンプリング
<ClientErrorTracker
  sampleRate={process.env.NODE_ENV === 'production' ? 0.5 : 1.0}
/>
```

### ブレッドクラム制限

- メモリ内: 最大50件
- CloudWatchへ送信: 最新10件のみ

### ログ保持期間

- 開発環境: 7日間
- 本番環境: 30日間

## セキュリティ

### PIIフィルタリング

自動的に以下をマスキング：
- メールアドレス → `[EMAIL]`
- 電話番号 → `[PHONE]`

### 除外URL

```typescript
installFetchInterceptor({
  ignoredUrls: ['/api/error-logging'], // 自己参照を防ぐ
});
```

## 今後の拡張案

- [ ] ソースマップサポート
- [ ] レート制限（Redis/Memory）
- [ ] CloudWatch Alarmsの設定
- [ ] CloudWatch Dashboardの作成
- [ ] バッチ送信（複数エラーをまとめて送信）
- [ ] エラーの自動グルーピングUIの作成
- [ ] エラー通知（Slack、Email）

## 参考資料

- [Sentry Documentation](https://docs.sentry.io/)
- [AWS CloudWatch Logs](https://docs.aws.amazon.com/cloudwatch/latest/logs/)
- [CloudWatch Logs Insights Query Syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)

## まとめ

このエラートラッキングシステムにより：

✅ **Sentryと同等の機能**を無料で実装
✅ **詳細なデバッグ情報**（ブレッドクラム、コンテキスト）
✅ **効率的なエラーグルーピング**（フィンガープリント）
✅ **柔軟なクエリ**（CloudWatch Logs Insights）
✅ **コスト最適化**（サンプリング、保持期間）
✅ **セキュアなログ管理**（PIIフィルタリング）

これにより、本番環境での問題を迅速に特定・修正できる環境が整いました。

