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
  getMFAFactors
} from "@/lib/auth"

export default function SecuritySettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [disabling, setDisabling] = useState(false)
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

      const mfaStatus = await checkMFAStatus()
      setMfaEnabled(mfaStatus)
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

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">セキュリティ</h1>

      <div className="space-y-6">
        {message && (
          <div className={`rounded-lg p-3 text-sm ${
            message.type === "success" 
              ? "bg-green-50 text-green-800" 
              : "bg-red-50 text-red-600"
          }`}>
            {message.text}
          </div>
        )}

        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">二段階認証（2FA）</h2>
              <p className="text-sm text-gray-600 mt-1">
                認証アプリを使用してアカウントのセキュリティを強化します
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              mfaEnabled 
                ? "bg-green-100 text-green-700" 
                : "bg-gray-100 text-gray-700"
            }`}>
              {mfaEnabled ? "有効" : "無効"}
            </div>
          </div>

          {!mfaEnabled && !qrCode && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">ステップ1: QRコードをスキャン</h3>
                <p className="text-sm text-blue-700 mb-4">
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
                    <p className="text-xs text-blue-700 mb-2">
                      QRコードをスキャンできない場合は、以下のキーを手動で入力してください：
                    </p>
                    <code className="block bg-white px-3 py-2 rounded text-sm font-mono text-gray-900 break-all">
                      {secret}
                    </code>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">ステップ2: 確認コードを入力</h3>
                <p className="text-sm text-blue-700 mb-4">
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-green-900">二段階認証が有効です</h3>
                    <p className="text-sm text-green-700 mt-1">
                      アカウントは認証アプリによる追加の保護で守られています
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowDisableDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                二段階認証を無効にする
              </Button>
            </div>
          )}
        </div>

        {/* Password Section (Future) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">パスワード</h2>
          <p className="text-sm text-gray-600 mb-4">
            パスワードの変更機能は近日追加予定です
          </p>
          <Button variant="outline" disabled className="opacity-50">
            パスワードを変更
          </Button>
        </div>

        {/* Login History (Future) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ログイン履歴</h2>
          <p className="text-sm text-gray-600">
            ログイン履歴機能は近日追加予定です
          </p>
        </div>
      </div>

      {/* Disable MFA Confirmation Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">二段階認証を無効にしますか？</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-gray-600">
                <p className="text-sm">
                  二段階認証を無効にすると、アカウントのセキュリティレベルが低下します。本当に無効にしますか？
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disabling} className="text-gray-700 border-gray-300">
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

