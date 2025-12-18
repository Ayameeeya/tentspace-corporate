# 🔴 エラートラッキング機能ガイド

Sentry風のクライアントエラートラッキングシステムを実装しました。

## 🎯 機能概要

- **クライアント側エラーキャッチ**: JavaScriptエラー、Promise拒否、Reactエラー
- **自動CloudWatch送信**: AWS CloudWatch Logsに自動送信
- **sendBeacon使用**: ページ遷移時も確実に送信完了（fetchにフォールバック対応）
- **PIIフィルタリング**: メールアドレスや電話番号を自動マスク
- **開発環境対応**: 開発中はコンソール出力 + CloudWatch送信

## 📦 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. AWS IAMユーザー作成

1. AWSコンソールで新しいIAMユーザーを作成
2. 以下のポリシーを付与:

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
      "Resource": "arn:aws:logs:ap-northeast-1:*:log-group:/tentspace/*"
    }
  ]
}
```

**追加した権限:**
- `logs:PutRetentionPolicy` - ログの保持期間を自動設定するために必要

3. アクセスキーとシークレットキーを取得

### 3. CloudWatch Logsの準備

**✅ ロググループは自動作成されます！**

最初のエラーログ送信時に以下のロググループが自動的に作成されます：

```
ロググループ名（開発環境）: /tentspace/frontend-errors/dev
  └─ 保持期間: 7日

ロググループ名（本番環境）: /tentspace/frontend-errors/prod
  └─ 保持期間: 30日
```

手動で事前作成したい場合は、AWSコンソールから作成できます。

### 4. 環境変数の設定

`.env.local` ファイルに以下を追加:

```env
# AWS認証情報
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=ap-northeast-1

# CloudWatch設定
CLOUDWATCH_LOG_GROUP_NAME=/tentspace/frontend-errors
CLOUDWATCH_LOG_STREAM_PREFIX=client-errors

# 本番環境のみCloudWatchに送信
NODE_ENV=production
```

**🗓️ 日別ログストリーム:**
ログストリームは自動的に日別で作成されます：
- `client-errors-2025-12-17`
- `client-errors-2025-12-18`
- `client-errors-2025-12-19`

これにより、特定の日のエラーを簡単に検索できます！

**🌍 環境別ロググループ:**
環境に応じて自動的にロググループが分離されます：
- 開発環境（`NODE_ENV=development`）: `/tentspace/frontend-errors/dev`
- 本番環境（`NODE_ENV=production`）: `/tentspace/frontend-errors/prod`

**ローカル開発環境からもCloudWatchに送信されます！**

## 🚀 使用方法

### 自動エラーキャッチ

すでに `app/layout.tsx` に組み込まれているため、自動的に動作します：

```typescript
// 何もしなくても以下のエラーが自動でキャッチされます
throw new Error('予期しないエラー');

// Promise拒否も自動キャッチ
Promise.reject('API呼び出し失敗');

// Reactコンポーネントエラーも自動キャッチ
function BuggyComponent() {
  throw new Error('レンダリングエラー');
}
```

### 手動エラーログ送信

特定の場所でエラーをログしたい場合:

```typescript
'use client';

import { useErrorTracking } from '@/hooks/use-error-tracking';

export function MyComponent() {
  const { logError } = useErrorTracking();

  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      // エラーを手動でCloudWatchに送信
      await logError(error as Error, {
        context: 'riskyOperation',
        userId: 'user123',
        additionalData: 'some info',
      });
    }
  };

  return <button onClick={handleAction}>実行</button>;
}
```

## 📊 CloudWatchでの確認方法

### 開発環境のエラー確認

1. **AWSコンソール** → **CloudWatch** → **Logs**
2. ロググループ `/tentspace/frontend-errors/dev` を選択
3. ログストリーム `client-errors-2025-12-17` を開く
4. JSONフォーマットでエラー情報が表示されます:

### 本番環境のエラー確認

1. **AWSコンソール** → **CloudWatch** → **Logs**
2. ロググループ `/tentspace/frontend-errors/prod` を選択
3. ログストリーム `client-errors-2025-12-17` を開く

### エラー情報のフォーマット

```json
{
  "message": "Uncaught Error: Something went wrong",
  "stack": "Error: Something went wrong\n    at ...",
  "url": "https://tentspace.net/blog/seo",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-12-17T12:34:56.789Z",
  "type": "error",
  "severity": "error"
}
```

## 🚀 sendBeacon による確実な送信

### なぜ sendBeacon を使うのか？

従来の `fetch` では、ページ遷移やタブを閉じる際にリクエストが中断される可能性があります。
`navigator.sendBeacon()` を使用することで、これらの問題を解決します。

#### sendBeacon の利点

✅ **ページ遷移時も送信完了**
- ユーザーが他のページに移動しても送信が完了
- ページを閉じても送信が保証される

✅ **バックグラウンド送信**
- ブラウザが最適なタイミングで送信
- ページのパフォーマンスに影響なし

✅ **自動フォールバック**
- `sendBeacon` が使えない場合は `fetch + keepalive: true` にフォールバック
- 古いブラウザでも動作

#### 実装例

```typescript
const payload = JSON.stringify(errorInfo);
const blob = new Blob([payload], { type: 'application/json' });

if (navigator.sendBeacon) {
  const sent = navigator.sendBeacon('/api/error-logging', blob);
  
  if (!sent) {
    // フォールバック: fetch with keepalive
    await fetch('/api/error-logging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  }
}
```

#### ブラウザサポート

- Chrome 39+
- Firefox 31+
- Safari 11.1+
- Edge 14+

→ 実質すべての現代的なブラウザで動作 ✅

---

## 🔧 設定のカスタマイズ

### サンプリングレート調整

すべてのエラーを送信するとコストがかかる場合、サンプリングレートを調整:

```typescript
// components/client-error-tracker.tsx
useErrorTracking({
  enabled: true,
  sampleRate: 0.1, // 10%のエラーのみ送信
});
```

### レート制限実装

`app/api/error-logging/route.ts` の TODO部分にRedisベースのレート制限を実装可能:

```typescript
// TODO: Redisやメモリキャッシュでレート制限を実装
// 例: 1IPあたり1分間に10リクエストまで
```

### エラー通知（オプション）

重大なエラーが発生したらSlack/Email通知を追加:

```typescript
// app/api/error-logging/route.ts
if (errorLog.severity === 'error') {
  // Slack Webhook送信
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🔴 Critical Error: ${errorLog.message}`,
    }),
  });
}
```

## 💰 コスト試算

### CloudWatch Logsの料金 (ap-northeast-1)

- **データ取り込み**: $0.76 / GB
- **ストレージ**: $0.033 / GB/月
- **データ転送**: 基本無料

### 想定コスト例

- 1エラーログ = 約1KB
- 1日1000エラー = 1MB
- 月間30MB = **約$0.024/月** 🎉

サンプリングレート10%なら **約$0.0024/月** (超低コスト)

## 🧪 テスト方法

### 開発環境でのテスト

```bash
npm run dev
```

ブラウザのコンソールで:

```javascript
// エラーをトリガー
throw new Error('テストエラー');

// コンソールに "🔴 [DEV] Client Error:" と表示されればOK
```

### 本番環境でのテスト

```bash
NODE_ENV=production npm run build
npm run start
```

実際にエラーを発生させ、CloudWatch Logsに送信されるか確認。

## 🛡️ セキュリティとプライバシー

### PIIフィルタリング

メールアドレスと電話番号は自動的にマスクされます:

```
Before: エラー: user@example.com でログイン失敗
After:  エラー: [EMAIL] でログイン失敗
```

### 追加のフィルタリング

`app/api/error-logging/route.ts` の `sanitizeErrorData()` でカスタマイズ可能:

```typescript
function sanitizeErrorData(data: ErrorLog): ErrorLog {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /\d{2,4}-\d{2,4}-\d{4}/g;
  const tokenRegex = /Bearer\s+[A-Za-z0-9-._~+\/]+=*/g; // JWTトークン
  
  return {
    ...data,
    message: data.message
      .replace(emailRegex, '[EMAIL]')
      .replace(phoneRegex, '[PHONE]')
      .replace(tokenRegex, '[TOKEN]'),
  };
}
```

## 📈 監視とアラート

### CloudWatch Alarmsの設定

エラーが急増したら通知:

1. CloudWatch → Alarms → Create Alarm
2. Metric: `/tentspace/frontend-errors` のログイベント数
3. Threshold: 1分間に10エラー以上
4. Action: SNS → Email/SMS通知

### ダッシュボード作成

1. CloudWatch → Dashboards → Create Dashboard
2. ウィジェットを追加:
   - エラー発生率（時系列グラフ）
   - エラータイプ別の分布（円グラフ）
   - 最新エラーログ（ログテーブル）

## 🔍 トラブルシューティング

### エラーがCloudWatchに送信されない

1. **環境変数チェック**:
```bash
echo $NODE_ENV
# production になっているか確認
```

2. **AWS認証情報チェック**:
```bash
# API動作確認
curl http://localhost:3000/api/error-logging
# {"status":"ok","environment":"production"} が返るはず
```

3. **CloudWatch Logs確認**:
- ロググループ `/tentspace/frontend-errors` が存在するか
- IAMユーザーに必要な権限があるか

### 開発環境でテストしたい

一時的に `NODE_ENV=production` で起動:

```bash
NODE_ENV=production npm run dev
```

または、`app/api/error-logging/route.ts` の環境チェックをコメントアウト。

## 📚 参考資料

- [AWS CloudWatch Logs 料金](https://aws.amazon.com/jp/cloudwatch/pricing/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Sentry Documentation](https://docs.sentry.io/) (参考)

---

**構築完了！** 🎉 これでSentry風のエラートラッキングが動作します。

