"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  getCurrentUser,
  checkMFAStatus,
  enrollMFA,
  verifyMFAEnrollment,
  unenrollMFA,
  getMFAFactors,
  changePassword
} from "@/lib/auth"
import { getLoginHistory, type LoginHistory } from "@/lib/dashboard"

export default function SecuritySettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  // MFA states
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [disabling, setDisabling] = useState(false)
  
  // Password states
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Login history states
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  // Message state
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadSecurityStatus()
  }, [])

  const loadSecurityStatus = async () => {
    setLoading(true)
    try {
      const currentUser = await getCurrentUser()
      
      if (!currentUser || !currentUser.email_confirmed_at) {
        router.push("/blog")
        return
      }

      setUserId(currentUser.id)
      const mfaStatus = await checkMFAStatus()
      setMfaEnabled(mfaStatus)
      
      // Load login history
      setLoadingHistory(true)
      const history = await getLoginHistory(currentUser.id, 10)
      setLoginHistory(history)
      setLoadingHistory(false)
    } catch (error) {
      console.error("Error loading security status:", error)
    }
    setLoading(false)
  }

  const handleEnableMFA = async () => {
    setEnrolling(true)
    setMessage(null)

    try {
      const enrollmentData = await enrollMFA()
      
      if (enrollmentData) {
        setQrCode(enrollmentData.qrCode)
        setSecret(enrollmentData.secret)
        setFactorId(enrollmentData.factorId)
      } else {
        setMessage({ type: "error", text: "二段階認証の設定に失敗しました" })
      }
    } catch (error) {
      console.error("Error enabling MFA:", error)
      setMessage({ type: "error", text: "二段階認証の設定に失敗しました" })
    }

    setEnrolling(false)
  }

  const handleVerifyCode = async () => {
    if (!factorId || !verificationCode) return

    setVerifying(true)
    setMessage(null)

    try {
      const verified = await verifyMFAEnrollment(factorId, verificationCode)
      
      if (verified) {
        setMessage({ type: "success", text: "二段階認証が有効になりました" })
        setMfaEnabled(true)
        setQrCode(null)
        setSecret(null)
        setFactorId(null)
        setVerificationCode("")
      } else {
        setMessage({ type: "error", text: "確認コードが正しくありません" })
      }
    } catch (error) {
      console.error("Error verifying code:", error)
      setMessage({ type: "error", text: "確認コードの検証に失敗しました" })
    }

    setVerifying(false)
  }

  const handleDisableMFA = async () => {
    setDisabling(true)
    setMessage(null)

    try {
      const factors = await getMFAFactors()
      const totpFactor = factors?.totp?.find(f => f.status === 'verified')
      
      if (totpFactor) {
        const disabled = await unenrollMFA(totpFactor.id)
        
        if (disabled) {
          setMessage({ type: "success", text: "二段階認証が無効になりました" })
          setMfaEnabled(false)
          setShowDisableDialog(false)
        } else {
          setMessage({ type: "error", text: "二段階認証の無効化に失敗しました" })
        }
      }
    } catch (error) {
      console.error("Error disabling MFA:", error)
      setMessage({ type: "error", text: "二段階認証の無効化に失敗しました" })
    }

    setDisabling(false)
  }

  const handleCancelEnrollment = () => {
    setQrCode(null)
    setSecret(null)
    setFactorId(null)
    setVerificationCode("")
    setMessage(null)
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "パスワードは8文字以上である必要があります"
    if (!/[a-z]/.test(password)) return "パスワードには小文字を1文字以上含める必要があります"
    if (!/[A-Z]/.test(password)) return "パスワードには大文字を1文字以上含める必要があります"
    if (!/[0-9]/.test(password)) return "パスワードには数字を1文字以上含める必要があります"
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "パスワードには特殊文字を1文字以上含める必要があります"
    return null
  }

  const handleChangePassword = async () => {
    setMessage(null)

    if (!currentPassword) {
      setMessage({ type: "error", text: "現在のパスワードを入力してください" })
      return
    }

    const validationError = validatePassword(newPassword)
    if (validationError) {
      setMessage({ type: "error", text: validationError })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "新しいパスワードが一致しません" })
      return
    }

    setChangingPassword(true)

    const result = await changePassword(currentPassword, newPassword)
    
    if (result.success) {
      setMessage({ type: "success", text: "パスワードを変更しました" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordForm(false)
    } else {
      setMessage({ type: "error", text: result.error || "パスワードの変更に失敗しました" })
    }

    setChangingPassword(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'mobile':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'tablet':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-8">セキュリティ</h1>

      <div className="space-y-6">
        {message && (
          <div className={`rounded-lg p-3 text-sm ${
            message.type === "success" 
              ? "bg-green-500/10 text-green-500" 
              : "bg-red-500/10 text-red-500"
          }`}>
            {message.text}
          </div>
        )}

        {/* Two-Factor Authentication */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">二段階認証（2FA）</h2>
              <p className="text-sm text-muted-foreground mt-1">
                認証アプリを使用してアカウントのセキュリティを強化します
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              mfaEnabled 
                ? "bg-green-500/10 text-green-500" 
                : "bg-muted text-muted-foreground"
            }`}>
              {mfaEnabled ? "有効" : "無効"}
            </div>
          </div>

          {!mfaEnabled && !qrCode && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Google AuthenticatorやAuthyなどの認証アプリを使用して、ログイン時に追加の確認コードを要求することで、アカウントをより安全に保護できます。
              </p>
              <Button
                onClick={handleEnableMFA}
                disabled={enrolling}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {enrolling ? "設定中..." : "二段階認証を有効にする"}
              </Button>
            </div>
          )}

          {qrCode && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-500 mb-2">ステップ1: QRコードをスキャン</h3>
                <p className="text-sm text-blue-500/80 mb-4">
                  認証アプリで以下のQRコードをスキャンしてください
                </p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <Image 
                    src={qrCode.trimEnd()} 
                    alt="QR Code" 
                    width={200} 
                    height={200}
                    className="mx-auto"
                  />
                </div>
                {secret && (
                  <div className="mt-4">
                    <p className="text-xs text-blue-500/80 mb-2">
                      QRコードをスキャンできない場合は、以下のキーを手動で入力してください：
                    </p>
                    <code className="block bg-muted px-3 py-2 rounded text-sm font-mono text-foreground break-all">
                      {secret}
                    </code>
                  </div>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-500 mb-2">ステップ2: 確認コードを入力</h3>
                <p className="text-sm text-blue-500/80 mb-4">
                  認証アプリに表示される6桁のコードを入力してください
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="flex-1 text-center text-2xl font-mono tracking-wider"
                  />
                  <Button
                    onClick={handleVerifyCode}
                    disabled={verifying || verificationCode.length !== 6}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {verifying ? "確認中..." : "確認"}
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleCancelEnrollment}
                className="w-full"
              >
                キャンセル
              </Button>
            </div>
          )}

          {mfaEnabled && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-green-500">二段階認証が有効です</h3>
                    <p className="text-sm text-green-500/80 mt-1">
                      アカウントは認証アプリによる追加の保護で守られています
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDisableDialog(true)}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/30"
              >
                二段階認証を無効にする
              </Button>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">パスワード</h2>
          
          {!showPasswordForm ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                定期的にパスワードを変更することで、アカウントをより安全に保護できます。
              </p>
              <Button
                onClick={() => setShowPasswordForm(true)}
                variant="outline"
              >
                パスワードを変更
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">現在のパスワード</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                    placeholder="現在のパスワードを入力"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">新しいパスワード</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    placeholder="新しいパスワードを入力"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  8文字以上、小文字・大文字・数字・特殊文字をそれぞれ1文字以上含める必要があります
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="新しいパスワードを再入力"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {changingPassword ? "変更中..." : "パスワードを変更"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setCurrentPassword("")
                    setNewPassword("")
                    setConfirmPassword("")
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Login History */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">ログイン履歴</h2>
          
          {loadingHistory ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 bg-muted-foreground/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : loginHistory.length > 0 ? (
            <div className="space-y-3">
              {loginHistory.map((history) => (
                <div key={history.id} className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    history.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {getDeviceIcon(history.device_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {history.browser || '不明なブラウザ'} / {history.os || '不明なOS'}
                      </p>
                      {!history.success && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-500 rounded">
                          失敗
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(history.created_at)}
                      {history.ip_address && ` • ${history.ip_address}`}
                      {history.location && ` • ${history.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-muted-foreground">ログイン履歴はまだありません</p>
            </div>
          )}
        </div>
      </div>

      {/* Disable MFA Confirmation Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">二段階認証を無効にしますか？</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-muted-foreground">
                <p className="text-sm">
                  二段階認証を無効にすると、アカウントのセキュリティレベルが低下します。本当に無効にしますか？
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disabling}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableMFA}
              disabled={disabling}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {disabling ? "無効化中..." : "無効にする"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
