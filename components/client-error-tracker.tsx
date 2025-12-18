'use client';

import { useEffect } from 'react';
import { useErrorTracking } from '@/hooks/use-error-tracking';
import { installFetchInterceptor, uninstallFetchInterceptor } from '@/lib/fetch-interceptor';

interface ClientErrorTrackerProps {
  /** ユーザー情報（ログイン時に設定） */
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  /** グローバルタグ */
  tags?: Record<string, string>;
  /** アプリケーションバージョン */
  release?: string;
  /** HTTPリクエストの追跡を有効にする（デフォルト: true） */
  trackHttpRequests?: boolean;
}

export function ClientErrorTracker({ 
  user, 
  tags, 
  release,
  trackHttpRequests = true 
}: ClientErrorTrackerProps) {
  // Fetch APIインターセプターをインストール
  useEffect(() => {
    if (trackHttpRequests) {
      installFetchInterceptor({
        enabled: true,
        ignoredUrls: ['/api/error-logging'], // エラーログAPI自体は除外
        captureRequestBody: false, // リクエストボディはキャプチャしない（PIIの可能性）
        captureResponseBody: false, // レスポンスボディもキャプチャしない
      });

      return () => {
        uninstallFetchInterceptor();
      };
    }
  }, [trackHttpRequests]);

  useErrorTracking({
    enabled: true,
    // 本番環境では50%サンプリング、開発環境では100%
    sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,
    maxBreadcrumbs: 50, // 最大ブレッドクラム数
    user: user,
    tags: {
      ...tags,
      // デフォルトのグローバルタグ
      app: 'tentspace-corporate',
      ...(typeof window !== 'undefined' && {
        screen: `${window.screen.width}x${window.screen.height}`,
      }),
    },
    release: release || process.env.NEXT_PUBLIC_APP_VERSION,
    onError: (error) => {
      // 開発環境ではコンソールに詳細を出力
      if (process.env.NODE_ENV === 'development') {
        console.group('🔴 Tracked Error');
        console.error('Message:', error.message);
        console.error('Type:', error.type);
        console.error('Fingerprint:', error.fingerprint);
        console.error('Tags:', error.tags);
        console.error('Breadcrumbs:', error.breadcrumbs);
        console.error('Device:', error.device);
        console.error('SessionID:', error.sessionId);
        console.groupEnd();
      }
    },
  });

  return null; // UIを表示しない
}

