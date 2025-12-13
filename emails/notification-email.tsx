import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface NotificationEmailProps {
  userName: string
  notificationType: 'new_follower' | 'new_comment' | 'new_like' | 'new_post'
  title: string
  message: string
  actionUrl?: string
  actionText?: string
}

export default function NotificationEmail({
  userName = 'ユーザー',
  notificationType = 'new_follower',
  title = '新しい通知',
  message = '通知があります',
  actionUrl,
  actionText = '詳細を見る',
}: NotificationEmailProps) {
  const getPreviewText = () => {
    switch (notificationType) {
      case 'new_follower':
        return '新しいフォロワーがいます'
      case 'new_comment':
        return '新しいコメントが届きました'
      case 'new_like':
        return '記事にいいねがつきました'
      case 'new_post':
        return 'フォロー中のユーザーが新しい記事を投稿しました'
      default:
        return '新しい通知があります'
    }
  }

  const getIconEmoji = () => {
    switch (notificationType) {
      case 'new_follower':
        return '👥'
      case 'new_comment':
        return '💬'
      case 'new_like':
        return '❤️'
      case 'new_post':
        return '📝'
      default:
        return '🔔'
    }
  }

  return (
    <Html>
      <Head />
      <Preview>{getPreviewText()}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Tentspace Blog</Text>
          </Section>

          <Section style={content}>
            <Text style={iconStyle}>{getIconEmoji()}</Text>
            <Heading style={heading}>{title}</Heading>
            <Text style={paragraph}>
              こんにちは、{userName}さん
            </Text>
            <Text style={paragraph}>{message}</Text>

            {actionUrl && (
              <Section style={buttonContainer}>
                <Link href={actionUrl} style={button}>
                  {actionText}
                </Link>
              </Section>
            )}
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              このメールは Tentspace Blog から自動送信されています。
            </Text>
            <Text style={footerText}>
              通知設定は{' '}
              <Link href="https://tentspace.net/settings/notifications" style={footerLink}>
                こちら
              </Link>
              {' '}から変更できます。
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Tentspace. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '24px 32px',
  borderBottom: '1px solid #e6e6e6',
}

const logo = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#2563eb',
  margin: '0',
}

const content = {
  padding: '32px',
}

const iconStyle = {
  fontSize: '48px',
  margin: '0 0 16px 0',
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#1f2937',
  margin: '0 0 24px 0',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '0 0 16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
}

const footer = {
  padding: '0 32px',
}

const footerText = {
  fontSize: '12px',
  lineHeight: '20px',
  color: '#6b7280',
  margin: '0 0 8px 0',
}

const footerLink = {
  color: '#2563eb',
  textDecoration: 'underline',
}

