import nodemailer from 'nodemailer'
import { render } from '@react-email/components'
import crypto from 'crypto'
import NotificationEmail from '@/emails/notification-email'

export type NotificationType = 'new_follower' | 'new_comment' | 'new_like' | 'new_post'

/**
 * AWS SESのSMTP認証情報を生成
 * IAMのシークレットアクセスキーからSMTPパスワードを生成する
 */
function generateSESSmtpPassword(secretAccessKey: string): string {
  const message = 'SendRawEmail'
  const versionInBytes = Buffer.from([0x02])
  
  const signatureInBytes = crypto
    .createHmac('sha256', secretAccessKey)
    .update(message)
    .digest()
  
  const signatureAndVersion = Buffer.concat([versionInBytes, signatureInBytes])
  return signatureAndVersion.toString('base64')
}

// Create SMTP transporter for Amazon SES
const getTransporter = () => {
  // AWS SES用の設定（AWS_ACCESS_KEY_ID と AWS_SECRET_ACCESS_KEY を使用）
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID
  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  const awsRegion = process.env.AWS_REGION || 'ap-northeast-1'
  
  // 従来のSMTP設定（カスタムSMTPサーバー用）
  const customHost = process.env.SMTP_HOST
  const customPort = process.env.SMTP_PORT
  const customUser = process.env.SMTP_USER
  const customPass = process.env.SMTP_PASS

  // AWS SESを使用する場合
  if (awsAccessKeyId && awsSecretAccessKey) {
    const smtpPassword = generateSESSmtpPassword(awsSecretAccessKey)
    
    return nodemailer.createTransport({
      host: `email-smtp.${awsRegion}.amazonaws.com`,
      port: 587,
      secure: false, // TLS (STARTTLS)
      auth: {
        user: awsAccessKeyId,
        pass: smtpPassword,
      },
    })
  }

  // カスタムSMTPサーバーを使用する場合
  if (customHost && customUser && customPass) {
    return nodemailer.createTransport({
      host: customHost,
      port: parseInt(customPort || '587'),
      secure: customPort === '465',
      auth: {
        user: customUser,
        pass: customPass,
      },
    })
  }

  console.warn('SMTP credentials not configured. Set AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY for SES, or SMTP_HOST/SMTP_USER/SMTP_PASS for custom SMTP.')
  return null
}

interface SendNotificationEmailParams {
  to: string
  userName: string
  notificationType: NotificationType
  title: string
  message: string
  actionUrl?: string
  actionText?: string
}

export async function sendNotificationEmail({
  to,
  userName,
  notificationType,
  title,
  message,
  actionUrl,
  actionText,
}: SendNotificationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter()
    
    if (!transporter) {
      return { 
        success: false, 
        error: 'SMTPが設定されていません。環境変数を確認してください。' 
      }
    }

    // Render React Email to HTML
    const emailHtml = await render(
      NotificationEmail({
        userName,
        notificationType,
        title,
        message,
        actionUrl,
        actionText,
      })
    )

    const fromAddress = process.env.SMTP_FROM || 'noreply@tentspace.net'

    const info = await transporter.sendMail({
      from: `Tentspace Blog <${fromAddress}>`,
      to,
      subject: title,
      html: emailHtml,
    })

    console.log('Email sent:', info.messageId)
    return { success: true }
  } catch (error) {
    console.error('Error in sendNotificationEmail:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'メール送信に失敗しました' 
    }
  }
}

// Helper function to send notification email based on type
export async function sendNotificationByType(
  to: string,
  userName: string,
  notificationType: NotificationType,
  actorName?: string,
  targetTitle?: string,
  actionUrl?: string
): Promise<{ success: boolean; error?: string }> {
  let title: string
  let message: string
  let actionText: string

  switch (notificationType) {
    case 'new_follower':
      title = '新しいフォロワー'
      message = `${actorName || '誰か'}さんがあなたをフォローしました。`
      actionText = 'プロフィールを見る'
      break
    case 'new_comment':
      title = '新しいコメント'
      message = `${actorName || '誰か'}さんがあなたの記事「${targetTitle || ''}」にコメントしました。`
      actionText = 'コメントを見る'
      break
    case 'new_like':
      title = '新しいいいね'
      message = `${actorName || '誰か'}さんがあなたの記事「${targetTitle || ''}」にいいねしました。`
      actionText = '記事を見る'
      break
    case 'new_post':
      title = '新しい記事'
      message = `フォロー中の${actorName || 'ユーザー'}さんが新しい記事「${targetTitle || ''}」を投稿しました。`
      actionText = '記事を読む'
      break
    default:
      title = '新しい通知'
      message = '新しい通知があります。'
      actionText = '確認する'
  }

  return sendNotificationEmail({
    to,
    userName,
    notificationType,
    title,
    message,
    actionUrl,
    actionText,
  })
}

// Test email function
export async function sendTestEmail(to: string, userName: string): Promise<{ success: boolean; error?: string }> {
  return sendNotificationEmail({
    to,
    userName,
    notificationType: 'new_follower',
    title: 'テストメール',
    message: 'これはTentspace Blogからのテストメールです。メール通知が正常に設定されました。',
    actionUrl: 'https://tentspace.net/profile',
    actionText: 'ダッシュボードを見る',
  })
}

// Verify SMTP connection
export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter()
    
    if (!transporter) {
      return { 
        success: false, 
        error: 'SMTPが設定されていません' 
      }
    }

    await transporter.verify()
    return { success: true }
  } catch (error) {
    console.error('SMTP verification failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'SMTP接続の確認に失敗しました' 
    }
  }
}
