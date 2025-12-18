# Tentspace Corporate Website

Next.js 16を使用したコーポレートウェブサイト

## 機能

### エラートラッキングシステム (Sentryライク)

このプロジェクトには、AWS CloudWatch Logsを使用した高度なエラートラッキングシステムが実装されています。

**主な機能:**
- ✅ エラーグルーピング（フィンガープリント）
- ✅ ブレッドクラム（イベント履歴）
- ✅ ユーザーコンテキスト
- ✅ デバイス・ブラウザ情報
- ✅ パフォーマンスメトリクス
- ✅ カスタムタグ
- ✅ セッション管理
- ✅ HTTPリクエスト自動追跡

**詳細なドキュメント:**
- [エラートラッキングシステム](./docs/ERROR_TRACKING.md) - セットアップと使い方
- [CloudWatch Logs Insights クエリ集](./docs/CLOUDWATCH_QUERIES.md) - 40以上のクエリサンプル

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成：

```bash
# AWS認証情報（エラートラッキング用）
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# CloudWatch設定（オプション）
CLOUDWATCH_LOG_GROUP_NAME=/tentspace/frontend-errors
CLOUDWATCH_LOG_STREAM_PREFIX=client-errors

# アプリバージョン（オプション）
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## エラートラッキングの使い方

### 自動エラートラッキング

`app/layout.tsx`に`ClientErrorTracker`を追加するだけで、すべてのエラーが自動的に追跡されます：

```tsx
import { ClientErrorTracker } from '@/components/client-error-tracker';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientErrorTracker
          user={{ id: 'user123', email: 'user@example.com' }}
          tags={{ environment: 'production' }}
          release="v1.0.0"
        />
        {children}
      </body>
    </html>
  );
}
```

### 手動エラーログ送信

```tsx
import { useErrorTracking } from '@/hooks/use-error-tracking';

function MyComponent() {
  const { logError, addBreadcrumb } = useErrorTracking();

  const handleSubmit = async () => {
    try {
      addBreadcrumb({
        category: 'user',
        message: 'Form submitted',
        level: 'info',
      });
      
      await submitForm();
    } catch (error) {
      await logError(error, {
        tags: { component: 'MyComponent' },
        extra: { formData: {...} },
      });
    }
  };
}
```

### CloudWatchでの確認

1. AWS CloudWatch Logsコンソールを開く
2. ロググループ: `/tentspace/frontend-errors/dev`または`/tentspace/frontend-errors/prod`
3. CloudWatch Logs Insightsで以下のクエリを実行：

```
fields @timestamp, @fingerprint, error.message, sessionId
| filter level = "error"
| stats count() by @fingerprint
| sort count desc
```

詳しくは[CloudWatch Logs Insights クエリ集](./docs/CLOUDWATCH_QUERIES.md)を参照してください。

## デモページ

エラートラッキングのデモページでテストできます：

```tsx
import { ErrorTrackingDemo } from '@/components/error-tracking-demo';

export default function DemoPage() {
  return <ErrorTrackingDemo />;
}
```

## スクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リンターチェック
npm run lint
```

## 技術スタック

- **フレームワーク**: Next.js 16
- **UI**: React 19, Tailwind CSS, Radix UI
- **エラートラッキング**: AWS CloudWatch Logs
- **認証**: Supabase
- **決済**: Stripe
- **アニメーション**: Framer Motion, GSAP
- **3D**: Three.js, React Three Fiber

## プロジェクト構造

```
tentspace-corporate/
├── app/                      # Next.js App Router
│   ├── api/
│   │   └── error-logging/    # エラーログAPI
│   └── layout.tsx
├── components/               # Reactコンポーネント
│   ├── client-error-tracker.tsx
│   ├── error-boundary.tsx
│   └── error-tracking-demo.tsx
├── hooks/                    # カスタムフック
│   └── use-error-tracking.ts
├── lib/                      # ユーティリティ
│   └── fetch-interceptor.ts
├── docs/                     # ドキュメント
│   ├── ERROR_TRACKING.md
│   └── CLOUDWATCH_QUERIES.md
└── README.md
```

## AWS IAMポリシー

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

## トラブルシューティング

### エラーが送信されない

1. AWS認証情報を確認：
```bash
echo $AWS_ACCESS_KEY_ID
```

2. APIエンドポイントを確認：
```bash
curl http://localhost:3000/api/error-logging
```

3. ブラウザのコンソールでエラーログを確認

### CloudWatchでログが見つからない

- ロググループ名を確認：`/tentspace/frontend-errors/dev`
- ログストリーム名を確認：`client-errors-2025-12-17`（当日の日付）
- IAMポリシーを確認

詳しくは[エラートラッキングシステム](./docs/ERROR_TRACKING.md)を参照してください。

## ライセンス

Private

