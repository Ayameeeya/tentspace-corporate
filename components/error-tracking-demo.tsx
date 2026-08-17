'use client';

import { useState } from 'react';
import { useErrorTracking, addBreadcrumb } from '@/hooks/use-error-tracking';

export function ErrorTrackingDemo() {
  const { logError } = useErrorTracking();
  const [testResult, setTestResult] = useState<string>('');
  const [eventId, setEventId] = useState<string>('');

  const triggerError = () => {
    setTestResult('⚡ JavaScriptエラーを発生させます...');
    // ブレッドクラムを追加
    addBreadcrumb({
      category: 'user',
      message: 'ユーザーがエラーボタンをクリック',
      level: 'info',
      data: { buttonType: 'javascript-error' },
    });
    
    // エラーを投げる（キャッチしない = グローバルハンドラーが処理）
    setTimeout(() => {
      throw new Error('【テスト】JavaScriptエラーをトリガーしました');
    }, 100);
  };

  const triggerPromiseRejection = () => {
    setTestResult('⚡ Promise拒否を発生させます...');
    // ブレッドクラムを追加
    addBreadcrumb({
      category: 'user',
      message: 'ユーザーがPromise拒否ボタンをクリック',
      level: 'info',
      data: { buttonType: 'promise-rejection' },
    });
    
    // Promiseを拒否（.catch()しない = unhandledrejection イベント発火）
    setTimeout(() => {
      Promise.reject(new Error('【テスト】Promise拒否をトリガーしました'));
    }, 100);
  };

  const triggerManualLog = async () => {
    // ブレッドクラムを追加
    addBreadcrumb({
      category: 'user',
      message: '手動ログボタンをクリック',
      level: 'info',
      data: { buttonType: 'manual-log' },
    });

    await logError('手動でログ送信したエラー', {
      extra: {
        testContext: 'デモページ',
        timestamp: new Date().toISOString(),
        feature: 'error-tracking-demo',
      },
      tags: {
        testType: 'manual',
        severity: 'medium',
      },
      level: 'warning',
    });
    setTestResult('✅ 手動エラーログを送信しました（タグとコンテキスト付き）');
  };

  const triggerWithUserContext = async () => {
    addBreadcrumb({
      category: 'user',
      message: 'ユーザーコンテキスト付きエラーをトリガー',
      level: 'info',
    });

    await logError('ユーザーコンテキスト付きエラー', {
      user: {
        id: 'demo-user-123',
        email: 'demo@example.com',
        username: 'demouser',
      },
      tags: {
        feature: 'demo',
        hasUserContext: 'true',
      },
      extra: {
        userAction: 'test-with-context',
        sessionDuration: 120,
      },
      level: 'error',
    });
    setTestResult('✅ ユーザーコンテキスト付きエラーを送信しました');
  };

  const simulateUserFlow = async () => {
    setTestResult('🔄 ユーザーフローをシミュレート中...');
    
    // ステップ1: ページ訪問
    addBreadcrumb({
      category: 'navigation',
      message: 'デモページに到着',
      level: 'info',
      data: { page: '/demo' },
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    // ステップ2: フォーム入力
    addBreadcrumb({
      category: 'user',
      message: 'フォームに入力開始',
      level: 'info',
      data: { formId: 'contact-form' },
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    // ステップ3: API呼び出し
    addBreadcrumb({
      category: 'http',
      message: 'APIリクエスト送信',
      level: 'info',
      data: { endpoint: '/api/submit', method: 'POST' },
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    // ステップ4: エラー発生
    addBreadcrumb({
      category: 'error',
      message: 'API呼び出しが失敗',
      level: 'error',
      data: { statusCode: 500, error: 'Internal Server Error' },
    });

    await logError('シミュレーション: API呼び出しエラー', {
      tags: {
        scenario: 'user-flow-simulation',
        step: 'api-call',
      },
      extra: {
        endpoint: '/api/submit',
        statusCode: 500,
        requestDuration: 1500,
      },
      level: 'error',
    });

    setTestResult('✅ ユーザーフローのシミュレーション完了（ブレッドクラム4件）');
  };

  const checkAPIStatus = async () => {
    setTestResult('🔍 APIステータスを確認中...');
    try {
      const response = await fetch('/api/error-logging');
      const data = await response.json();
      setTestResult(
        `✅ API Status: ${data.status}\n` +
        `📁 Log Group: ${data.logGroupName}\n` +
        `📄 Log Stream: ${data.logStreamName}\n` +
        `🌍 Environment: ${data.environment}\n` +
        `🔐 AWS Configured: ${data.awsConfigured ? 'はい' : 'いいえ'}`
      );
    } catch (error) {
      setTestResult('❌ APIステータスの取得に失敗しました');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">🔴 エラートラッキング デモ</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Sentryライクなエラートラッキングシステム（CloudWatch Logs統合）
      </p>
      
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <span>✨</span>
            <span>実装済み機能</span>
          </h2>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>✅ エラーグルーピング（フィンガープリント）</li>
            <li>✅ ブレッドクラム（イベント履歴）</li>
            <li>✅ ユーザーコンテキスト</li>
            <li>✅ デバイス・ブラウザ情報</li>
            <li>✅ パフォーマンスメトリクス</li>
            <li>✅ カスタムタグと追加コンテキスト</li>
            <li>✅ セッション管理</li>
          </ul>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>すべてのエラーがCloudWatch Logsに自動送信されます</strong>
            <br />
            開発環境: コンソール詳細出力 + CloudWatch送信
            <br />
            本番環境: CloudWatch送信のみ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={triggerError}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            1️⃣ JavaScriptエラー
          </button>

          <button
            type="button"
            onClick={triggerPromiseRejection}
            className="px-4 py-3 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors font-medium"
          >
            2️⃣ Promise拒否
          </button>

          <button
            type="button"
            onClick={triggerManualLog}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            3️⃣ 手動ログ送信
          </button>

          <button
            type="button"
            onClick={triggerWithUserContext}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            4️⃣ ユーザーコンテキスト付き
          </button>

          <button
            type="button"
            onClick={simulateUserFlow}
            className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium md:col-span-2"
          >
            5️⃣ ユーザーフローのシミュレート（ブレッドクラム4件）
          </button>

          <button
            type="button"
            onClick={checkAPIStatus}
            className="px-4 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium md:col-span-2"
          >
            📊 APIステータスを確認
          </button>
        </div>

        {testResult && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
            <p className="text-sm whitespace-pre-line font-mono">{testResult}</p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h2 className="font-semibold mb-2">📋 確認方法</h2>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>ブラウザのコンソールを開く（F12）</li>
              <li>エラーボタンをクリック</li>
              <li>コンソールに詳細が表示される</li>
              <li>CloudWatch Logsで確認</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <h2 className="font-semibold mb-2">🔍 CloudWatch Logs Insights</h2>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>ロググループ: <code className="text-xs">/tentspace/frontend-errors/*</code></li>
              <li>フィンガープリントでグルーピング可能</li>
              <li>ブレッドクラムで操作履歴を追跡</li>
              <li>タグでフィルタリング可能</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <h2 className="font-semibold mb-2">💡 CloudWatch Logs Insights クエリ例</h2>
          <pre tabIndex={0} className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`# エラーをフィンガープリント別にグルーピング
fields @timestamp, @fingerprint, error.message
| filter level = "error"
| stats count() by @fingerprint
| sort count desc`}
          </pre>
        </div>
      </div>
    </div>
  );
}
