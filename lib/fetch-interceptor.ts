/**
 * Fetch APIインターセプター
 * すべてのHTTPリクエストをブレッドクラムとして自動追跡
 */

import { addBreadcrumb } from '@/hooks/use-error-tracking';

interface FetchInterceptorOptions {
  enabled?: boolean;
  ignoredUrls?: string[]; // 追跡しないURL（例: /api/error-logging）
  captureRequestBody?: boolean;
  captureResponseBody?: boolean;
}

let isInterceptorInstalled = false;
let originalFetch: typeof fetch | null = null;

export function installFetchInterceptor(options: FetchInterceptorOptions = {}) {
  // ブラウザ環境でのみ実行
  if (typeof window === 'undefined') {
    return;
  }

  // すでにインストールされている場合はスキップ
  if (isInterceptorInstalled) {
    return;
  }

  // オリジナルのfetchを保存
  originalFetch = window.fetch;

  const {
    enabled = true,
    ignoredUrls = ['/api/error-logging'], // デフォルトでエラーログAPIは除外
    captureRequestBody = false,
    captureResponseBody = false,
  } = options;

  if (!enabled) {
    return;
  }

  // fetch APIをオーバーライド
  window.fetch = async function interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';
    const startTime = Date.now();

    // 除外URLチェック
    const shouldIgnore = ignoredUrls.some(ignoredUrl => url.includes(ignoredUrl));
    if (shouldIgnore || !originalFetch) {
      return originalFetch!(input, init);
    }

    // リクエストボディをキャプチャ（オプション）
    let requestBody: any = undefined;
    if (captureRequestBody && init?.body) {
      try {
        if (typeof init.body === 'string') {
          requestBody = JSON.parse(init.body);
        }
      } catch {
        // JSONでない場合は無視
      }
    }

    try {
      // 実際のリクエストを実行
      const response = await originalFetch!(input, init);
      const duration = Date.now() - startTime;

      // レスポンスボディをキャプチャ（オプション）
      let responseBody: any = undefined;
      if (captureResponseBody && response.ok) {
        try {
          const clone = response.clone();
          responseBody = await clone.json();
        } catch {
          // JSONでない場合は無視
        }
      }

      // 成功したリクエストをブレッドクラムに追加
      addBreadcrumb({
        category: 'http',
        message: `${method} ${url}`,
        level: response.ok ? 'info' : 'warning',
        data: {
          url,
          method,
          statusCode: response.status,
          duration,
          ...(requestBody && { requestBody }),
          ...(responseBody && { responseBody }),
        },
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // 失敗したリクエストをブレッドクラムに追加
      addBreadcrumb({
        category: 'http',
        message: `${method} ${url} - Failed`,
        level: 'error',
        data: {
          url,
          method,
          duration,
          error: error instanceof Error ? error.message : String(error),
          ...(requestBody && { requestBody }),
        },
      });

      // エラーを再スロー
      throw error;
    }
  };

  isInterceptorInstalled = true;
  console.log('✅ Fetch interceptor installed');
}

export function uninstallFetchInterceptor() {
  if (typeof window === 'undefined' || !isInterceptorInstalled || !originalFetch) {
    return;
  }

  window.fetch = originalFetch;
  isInterceptorInstalled = false;
  console.log('✅ Fetch interceptor uninstalled');
}

export function isInterceptorActive(): boolean {
  return isInterceptorInstalled;
}

