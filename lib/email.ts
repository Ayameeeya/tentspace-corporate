import nodemailer from 'nodemailer'
import { render } from '@react-email/components'
import NotificationEmail from '@/emails/notification-email'

export type NotificationType = 'new_follower' | 'new_comment' | 'new_like' | 'new_post'

// Create SMTP transporter for Amazon SES
const getTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn('SMTP credentials not configured')
    return null
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port || '587'),
    secure: port === '465', // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  })
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
