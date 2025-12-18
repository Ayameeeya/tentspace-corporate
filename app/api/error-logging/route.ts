import { NextRequest, NextResponse } from 'next/server';
import { 
  CloudWatchLogsClient, 
  PutLogEventsCommand, 
  CreateLogStreamCommand,
  CreateLogGroupCommand,
  PutRetentionPolicyCommand
} from '@aws-sdk/client-cloudwatch-logs';

// CloudWatch Logs クライアント初期化
const cloudWatchClient = new CloudWatchLogsClient({
  region: process.env.CLOUDWATCH_AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.CLOUDWATCH_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDWATCH_AWS_SECRET_ACCESS_KEY || '',
  },
});

// 環境に応じたロググループ名を生成
function getLogGroupName(): string {
  const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const baseGroupName = process.env.CLOUDWATCH_LOG_GROUP_NAME || '/tentspace/frontend-errors';
  return `${baseGroupName}/${env}`;
}

const LOG_STREAM_PREFIX = process.env.CLOUDWATCH_LOG_STREAM_PREFIX || 'client-errors';

// 日別のログストリーム名を生成（例: client-errors-2025-12-17）
function generateLogStreamName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${LOG_STREAM_PREFIX}-${year}-${month}-${day}`;
}

// ブレッドクラム（イベント履歴）
interface Breadcrumb {
  timestamp: string;
  category: 'navigation' | 'console' | 'http' | 'user' | 'error';
  message: string;
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

// ユーザーコンテキスト
interface UserContext {
  id?: string;
  email?: string;
  username?: string;
  ip_address?: string;
}

// デバイス・ブラウザ情報
interface DeviceContext {
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

interface ErrorLog {
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
  sessionId?: string;
  release?: string;
  environment?: string;
}

// PIIフィルタリング（メールアドレス、電話番号など）
function sanitizeErrorData(data: ErrorLog): ErrorLog {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /\d{2,4}-\d{2,4}-\d{4}/g;
  
  return {
    ...data,
    message: data.message.replace(emailRegex, '[EMAIL]').replace(phoneRegex, '[PHONE]'),
    stack: data.stack?.replace(emailRegex, '[EMAIL]').replace(phoneRegex, '[PHONE]'),
  };
}

// ロググループを作成（存在しない場合）
async function ensureLogGroup() {
  try {
    const logGroupName = getLogGroupName();
    const createGroupCommand = new CreateLogGroupCommand({
      logGroupName: logGroupName,
    });
    await cloudWatchClient.send(createGroupCommand);
    
    // 保持期間を設定（開発環境: 7日、本番環境: 30日）
    const retentionDays = process.env.NODE_ENV === 'production' ? 30 : 7;
    const retentionCommand = new PutRetentionPolicyCommand({
      logGroupName: logGroupName,
      retentionInDays: retentionDays,
    });
    await cloudWatchClient.send(retentionCommand);
    
    console.log(`✅ Created log group: ${logGroupName} (retention: ${retentionDays} days)`);
  } catch (error: any) {
    // ロググループが既に存在する場合はエラーを無視
    if (error.name !== 'ResourceAlreadyExistsException') {
      console.error('Failed to create log group:', error);
    }
  }
}

// ログストリームを作成（存在しない場合）
async function ensureLogStream(logStreamName: string) {
  const logGroupName = getLogGroupName();
  
  try {
    const command = new CreateLogStreamCommand({
      logGroupName: logGroupName,
      logStreamName: logStreamName,
    });
    await cloudWatchClient.send(command);
  } catch (error: any) {
    // ログストリームが既に存在する場合はエラーを無視
    if (error.name !== 'ResourceAlreadyExistsException') {
      console.error('Failed to create log stream:', error);
      
      // ロググループが存在しない場合は作成を試みる
      if (error.name === 'ResourceNotFoundException') {
        console.log('🔄 Log group not found, creating...');
        await ensureLogGroup();
        // 再度ログストリーム作成を試みる
        const retryCommand = new CreateLogStreamCommand({
          logGroupName: logGroupName,
          logStreamName: logStreamName,
        });
        await cloudWatchClient.send(retryCommand);
      }
    }
  }
}

// イベントIDを生成（Sentryライク）
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// CloudWatchにログを送信
async function sendToCloudWatch(errorLog: ErrorLog) {
  try {
    // 環境に応じたロググループ名を取得
    const logGroupName = getLogGroupName();
    
    // 日別のログストリーム名を生成
    const logStreamName = generateLogStreamName();
    
    // ログストリームが存在することを確認
    await ensureLogStream(logStreamName);

    // イベントIDを生成
    const eventId = generateEventId();

    // 構造化ログメッセージ（CloudWatch Logs Insightsで検索しやすい形式）
    const structuredLog = {
      // イベント識別子
      eventId: eventId,
      level: errorLog.severity,
      timestamp: errorLog.timestamp,
      
      // エラー基本情報
      error: {
        type: errorLog.type,
        message: errorLog.message,
        stack: errorLog.stack,
        componentStack: errorLog.componentStack,
      },
      
      // グルーピング情報
      fingerprint: errorLog.fingerprint?.join('::') || 'unknown',
      
      // コンテキスト情報
      context: {
        url: errorLog.url,
        userAgent: errorLog.userAgent,
        tags: errorLog.tags,
        extra: errorLog.extra,
      },
      
      // ユーザー情報
      user: errorLog.user,
      
      // デバイス情報
      device: errorLog.device,
      
      // パフォーマンス情報
      performance: errorLog.performance,
      
      // セッション情報
      sessionId: errorLog.sessionId,
      release: errorLog.release,
      environment: errorLog.environment,
      
      // ブレッドクラム（最新10件のみ保存して容量を削減）
      breadcrumbs: errorLog.breadcrumbs?.slice(-10),
      
      // CloudWatch Logs Insights用のフィールド
      '@message': `[${errorLog.severity.toUpperCase()}] ${errorLog.type}: ${errorLog.message}`,
      '@fingerprint': errorLog.fingerprint?.join('::') || 'unknown',
      '@url': errorLog.url,
      '@sessionId': errorLog.sessionId,
    };

    const command = new PutLogEventsCommand({
      logGroupName: logGroupName,
      logStreamName: logStreamName,
      logEvents: [
        {
          message: JSON.stringify(structuredLog),
          timestamp: new Date(errorLog.timestamp).getTime(),
        },
      ],
    });

    await cloudWatchClient.send(command);
    
    // 開発環境では詳細ログを出力
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Sent to CloudWatch:', {
        eventId,
        fingerprint: structuredLog.fingerprint,
        message: errorLog.message,
      });
    }
    
    return { success: true, eventId };
  } catch (error) {
    console.error('Failed to send logs to CloudWatch:', error);
    return { success: false, eventId: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    // AWS認証情報チェック
    if (!process.env.CLOUDWATCH_AWS_ACCESS_KEY_ID || !process.env.CLOUDWATCH_AWS_SECRET_ACCESS_KEY) {
      console.error('AWS credentials are not configured');
      // 開発環境の場合はコンソールに出力のみ
      if (process.env.NODE_ENV === 'development') {
        const body = await request.json();
        console.log('🔴 [DEV] Client Error (AWS未設定):', body);
        return NextResponse.json({ success: true, mode: 'development', cloudwatch: false });
      }
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // レート制限（IPごとに1分間に10リクエストまで）
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    // TODO: Redisやメモリキャッシュでレート制限を実装

    const errorLog: ErrorLog = await request.json();

    // データのサニタイズ
    const sanitizedLog = sanitizeErrorData(errorLog);

    // 開発環境の場合はコンソールにも出力
    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 [DEV] Client Error → CloudWatch:', {
        logGroup: getLogGroupName(),
        logStream: generateLogStreamName(),
        error: sanitizedLog,
      });
    }

    // CloudWatchに送信（開発環境・本番環境どちらも送信）
    const result = await sendToCloudWatch(sanitizedLog);

    if (result.success) {
      return NextResponse.json({ 
        success: true,
        eventId: result.eventId, // イベントID（Sentryライク）
        environment: process.env.NODE_ENV,
        logGroup: getLogGroupName(),
        fingerprint: sanitizedLog.fingerprint?.join('::'),
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to log error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in error-logging API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// HEALTHチェック用
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    logGroupName: getLogGroupName(), // 環境に応じたロググループ名
    logStreamName: generateLogStreamName(), // 今日のログストリーム名
    logStreamPrefix: LOG_STREAM_PREFIX,
    environment: process.env.NODE_ENV || 'development',
    awsConfigured: !!(process.env.CLOUDWATCH_AWS_ACCESS_KEY_ID && process.env.CLOUDWATCH_AWS_SECRET_ACCESS_KEY),
  });
}

