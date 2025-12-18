'use client';

import { useEffect, useRef } from 'react';

// ブレッドクラム（イベント履歴）
export interface Breadcrumb {
  timestamp: string;
  category: 'navigation' | 'console' | 'http' | 'user' | 'error';
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

// ユーザーコンテキスト
export interface UserContext {
  id?: string;
  email?: string;
  username?: string;
  ip_address?: string;
}

// デバイス・ブラウザ情報
export interface DeviceContext {
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  screen: {
    width: number;
    height: number;
  };
  language: string;
  timezone: string;
}

// 拡張されたエラー情報
export interface ErrorInfo {
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
  fingerprint?: string[]; // エラーグルーピング用
  tags?: Record<string, string>; // タグ
  extra?: Record<string, any>; // 追加コンテキスト
  breadcrumbs?: Breadcrumb[]; // イベント履歴
  user?: UserContext; // ユーザー情報
  device?: DeviceContext; // デバイス情報
  
  // パフォーマンス情報
  performance?: {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
    navigation?: {
      loadTime: number;
      domContentLoadedTime: number;
    };
  };
  
  // セッション情報
  sessionId?: string;
  release?: string; // アプリバージョン
  environment?: string; // dev/staging/prod
}

interface UseErrorTrackingOptions {
  enabled?: boolean;
  onError?: (error: ErrorInfo) => void;
  sampleRate?: number; // 0.0 - 1.0 (1.0 = 100%)
  maxBreadcrumbs?: number; // 最大ブレッドクラム数（デフォルト: 50）
  user?: UserContext; // ユーザーコンテキスト
  tags?: Record<string, string>; // グローバルタグ
  release?: string; // アプリバージョン
}

// グローバルブレッドクラムストア
const breadcrumbsStore: Breadcrumb[] = [];
const MAX_BREADCRUMBS = 50;

// セッションID生成（ページロード時に一度だけ生成）
let sessionId: string | null = null;
function getSessionId(): string {
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
  return sessionId;
}

// デバイス情報を取得
function getDeviceContext(): DeviceContext {
  const userAgent = navigator.userAgent;
  
  // ブラウザ検出
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  if (userAgent.includes('Chrome')) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Safari')) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Edge')) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/Edge\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }
  
  // OS検出
  let osName = 'Unknown';
  let osVersion = 'Unknown';
  if (userAgent.includes('Windows NT')) {
    osName = 'Windows';
    osVersion = userAgent.match(/Windows NT (\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Mac OS X')) {
    osName = 'macOS';
    osVersion = userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux';
  } else if (userAgent.includes('Android')) {
    osName = 'Android';
    osVersion = userAgent.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('iOS')) {
    osName = 'iOS';
    osVersion = userAgent.match(/OS (\d+_\d+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  }
  
  return {
    browser: {
      name: browserName,
      version: browserVersion,
    },
    os: {
      name: osName,
      version: osVersion,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

// パフォーマンス情報を取得
function getPerformanceMetrics() {
  const performance = window.performance as any;
  const memory = performance.memory;
  const navigation = performance.getEntriesByType('navigation')[0] as any;
  
  return {
    memory: memory ? {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    } : undefined,
    navigation: navigation ? {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoadedTime: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    } : undefined,
  };
}

// エラーフィンガープリント生成（グルーピング用）
function generateFingerprint(error: Error | string, componentStack?: string): string[] {
  const message = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? undefined : error.stack;
  
  // スタックトレースの最初の行（エラーが発生した場所）を使用
  const stackFirstLine = stack?.split('\n')[1]?.trim() || '';
  
  // コンポーネントスタックの最初の行
  const componentFirstLine = componentStack?.split('\n')[1]?.trim() || '';
  
  // フィンガープリント配列
  const fingerprint = [
    message.split(':')[0], // エラーの種類
    stackFirstLine || componentFirstLine || 'unknown-location',
  ];
  
  return fingerprint;
}

// ブレッドクラムを追加
export function addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>) {
  if (breadcrumbsStore.length >= MAX_BREADCRUMBS) {
    breadcrumbsStore.shift(); // 古いものから削除
  }
  
  breadcrumbsStore.push({
    ...breadcrumb,
    timestamp: new Date().toISOString(),
  });
}

// ブレッドクラムを取得
function getBreadcrumbs(): Breadcrumb[] {
  return [...breadcrumbsStore];
}

export function useErrorTracking(options: UseErrorTrackingOptions = {}) {
  const {
    enabled = true,
    onError,
    sampleRate = 1.0,
    maxBreadcrumbs = MAX_BREADCRUMBS,
    user,
    tags,
    release,
  } = options;

  const deviceContextRef = useRef<DeviceContext | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // デバイス情報を一度だけ取得
    if (!deviceContextRef.current) {
      deviceContextRef.current = getDeviceContext();
    }

    // ナビゲーションのブレッドクラムを自動追加
    addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${window.location.pathname}`,
      level: 'info',
      data: { url: window.location.href },
    });

    // サンプリング判定
    const shouldSample = () => Math.random() < sampleRate;

    // エラー情報を拡張
    const enrichErrorInfo = (baseError: Partial<ErrorInfo>): ErrorInfo => {
      const error = baseError.message ? (baseError as any) : new Error('Unknown error');
      
      return {
        ...baseError,
        message: baseError.message || 'Unknown error',
        url: baseError.url || window.location.href,
        userAgent: baseError.userAgent || navigator.userAgent,
        timestamp: baseError.timestamp || new Date().toISOString(),
        type: baseError.type || 'error',
        severity: baseError.severity || 'error',
        
        // Sentryライクな追加情報
        fingerprint: generateFingerprint(error, baseError.componentStack),
        tags: { ...tags, url: window.location.pathname },
        extra: {
          referrer: document.referrer,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        },
        breadcrumbs: getBreadcrumbs(),
        user: user,
        device: deviceContextRef.current || undefined,
        performance: getPerformanceMetrics(),
        sessionId: getSessionId(),
        release: release || process.env.NEXT_PUBLIC_APP_VERSION,
        environment: process.env.NODE_ENV || 'development',
      } as ErrorInfo;
    };

    // エラーをCloudWatchに送信
    const sendToCloudWatch = async (errorInfo: ErrorInfo) => {
      if (!shouldSample()) return;

      try {
        const payload = JSON.stringify(errorInfo);
        
        // sendBeacon を使用（ページ遷移時も送信完了を保証）
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          const sent = navigator.sendBeacon('/api/error-logging', blob);
          
          if (!sent) {
            // sendBeacon が失敗した場合は fetch にフォールバック
            console.warn('sendBeacon failed, falling back to fetch');
            await fallbackFetch(payload);
          }
        } else {
          // sendBeacon が使えない古いブラウザは fetch を使用
          await fallbackFetch(payload);
        }
      } catch (error) {
        console.error('Failed to send error to CloudWatch:', error);
      }
    };

    // fetch フォールバック関数
    const fallbackFetch = async (payload: string) => {
      await fetch('/api/error-logging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        keepalive: true, // ページ遷移時も送信を継続
      });
    };

    // JavaScript エラーハンドラー
    const handleError = (event: ErrorEvent) => {
      // エラーブレッドクラムを追加
      addBreadcrumb({
        category: 'error',
        message: event.message,
        level: 'error',
        data: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });

      const errorInfo = enrichErrorInfo({
        message: event.message,
        stack: event.error?.stack,
        type: 'error',
        severity: 'error',
      });

      onError?.(errorInfo);
      sendToCloudWatch(errorInfo);
    };

    // Promise拒否ハンドラー
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // エラーブレッドクラムを追加
      addBreadcrumb({
        category: 'error',
        message: event.reason?.message || String(event.reason),
        level: 'error',
        data: { reason: String(event.reason) },
      });

      const errorInfo = enrichErrorInfo({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        type: 'unhandledrejection',
        severity: 'error',
      });

      onError?.(errorInfo);
      sendToCloudWatch(errorInfo);
    };

    // コンソールエラーをキャプチャ（オプション）
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      addBreadcrumb({
        category: 'console',
        message: args.map(arg => String(arg)).join(' '),
        level: 'error',
      });
      originalConsoleError.apply(console, args);
    };

    // イベントリスナー登録
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // クリーンアップ
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, [enabled, onError, sampleRate, maxBreadcrumbs, user, tags, release]);

  // 手動でエラーを送信する関数
  const logError = async (
    error: Error | string, 
    context?: {
      extra?: Record<string, any>;
      tags?: Record<string, string>;
      user?: UserContext;
      level?: 'error' | 'warning' | 'info';
    }
  ) => {
    if (!deviceContextRef.current) {
      deviceContextRef.current = getDeviceContext();
    }

    // ブレッドクラムを追加
    addBreadcrumb({
      category: 'error',
      message: typeof error === 'string' ? error : error.message,
      level: context?.level || 'error',
      data: context?.extra,
    });

    const errorObj = typeof error === 'string' ? new Error(error) : error;

    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      type: 'error',
      severity: context?.level || 'error',
      
      // Sentryライクな追加情報
      fingerprint: generateFingerprint(errorObj),
      tags: { ...tags, ...context?.tags, url: window.location.pathname },
      extra: {
        ...context?.extra,
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
      breadcrumbs: getBreadcrumbs(),
      user: context?.user || user,
      device: deviceContextRef.current || undefined,
      performance: getPerformanceMetrics(),
      sessionId: getSessionId(),
      release: release || process.env.NEXT_PUBLIC_APP_VERSION,
      environment: process.env.NODE_ENV || 'development',
    };

    try {
      const payload = JSON.stringify(errorInfo);
      
      // sendBeacon を優先使用
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        const sent = navigator.sendBeacon('/api/error-logging', blob);
        
        if (!sent) {
          // sendBeacon が失敗した場合は fetch にフォールバック
          await fetch('/api/error-logging', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          });
        }
      } else {
        // sendBeacon が使えない場合は fetch を使用
        await fetch('/api/error-logging', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        });
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  };

  return { logError, addBreadcrumb };
}

