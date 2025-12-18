'use client';

import React, { Component, ErrorInfo as ReactErrorInfo, ReactNode } from 'react';
import { ErrorInfo } from '@/hooks/use-error-tracking';
import { EyeLoader } from '@/components/eye-loader';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ReactErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    // カスタムエラーハンドラー呼び出し
    this.props.onError?.(error, errorInfo);

    // CloudWatchに送信
    this.sendToCloudWatch(error, errorInfo);
  }

  async sendToCloudWatch(error: Error, errorInfo: ReactErrorInfo) {
    // デバイス情報を取得
    const getDeviceContext = () => {
      if (typeof window === 'undefined') return undefined;

      const userAgent = navigator.userAgent;
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
      }

      return {
        browser: { name: browserName, version: browserVersion },
        os: { name: 'Unknown', version: 'Unknown' },
        screen: { width: window.screen.width, height: window.screen.height },
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    };

    // パフォーマンス情報を取得
    const getPerformanceMetrics = () => {
      if (typeof window === 'undefined') return undefined;

      const performance = window.performance as any;
      const memory = performance.memory;

      return {
        memory: memory ? {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        } : undefined,
      };
    };

    // エラーフィンガープリント生成
    const generateFingerprint = (error: Error, componentStack?: string): string[] => {
      const stackFirstLine = error.stack?.split('\n')[1]?.trim() || '';
      const componentFirstLine = componentStack?.split('\n')[1]?.trim() || '';

      return [
        error.message.split(':')[0],
        stackFirstLine || componentFirstLine || 'unknown-component',
      ];
    };

    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
      type: 'react',
      componentStack: errorInfo.componentStack || undefined,
      severity: 'error',

      // Sentryライクな追加情報
      fingerprint: generateFingerprint(error, errorInfo.componentStack || undefined),
      tags: {
        errorBoundary: 'true',
        componentStack: errorInfo.componentStack ? 'available' : 'unavailable',
      },
      extra: typeof window !== 'undefined' ? {
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      } : undefined,
      device: getDeviceContext(),
      performance: getPerformanceMetrics(),
      sessionId: typeof window !== 'undefined' ?
        `${Date.now()}-${Math.random().toString(36).substring(2, 11)}` : undefined,
      release: process.env.NEXT_PUBLIC_APP_VERSION,
      environment: process.env.NODE_ENV || 'development',
    };

    try {
      const payload = JSON.stringify(errorData);

      // sendBeacon を優先使用（Reactエラーは重要なので確実に送信）
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
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
      console.error('Failed to send error to CloudWatch:', err);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <DefaultErrorFallback error={this.state.error} />
        )
      );
    }

    return this.props.children;
  }
}

// デフォルトエラーフォールバックコンポーネント
function DefaultErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="max-w-2xl w-full text-center py-12">
          {/* Eye Animation */}
          <div className="mb-6 flex justify-center">
            <div className="scale-75 md:scale-100">
              <EyeLoader variant="end" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-8">
            <h1 className="text-[120px] md:text-[180px] font-black font-tech text-foreground/60 leading-none select-none">
              ERROR
            </h1>
          </div>

          {/* Message */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-4xl font-bold font-tech text-foreground mb-4">
              エラーが発生しました
            </h2>
            <p className="text-muted-foreground mb-6">
              申し訳ございません。予期しないエラーが発生しました
            </p>
            {error && process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-left max-w-md mx-auto">
                <details className="text-xs text-muted-foreground bg-muted/30 border border-border rounded-lg p-4">
                  <summary className="cursor-pointer font-mono mb-2">
                    エラー詳細（開発環境のみ）
                  </summary>
                  <pre className="overflow-auto font-mono text-[10px] mt-2">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Reload Button */}
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-foreground text-background font-bold rounded-full hover:opacity-90 transition-opacity"
          >
            ページをリロード
          </button>
        </div>
      </main>
    </div>
  );
}

