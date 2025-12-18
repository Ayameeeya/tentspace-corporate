"use client"

import { useState } from "react"
import Image from "next/image"
import { supabaseAuth } from "@/lib/supabase/client"
import { recordLoginHistory } from "@/lib/dashboard"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type AuthMode = "login" | "signup" | "forgot"

// ブラウザ・デバイス情報を取得
function getDeviceInfo() {
  const ua = navigator.userAgent

  // ブラウザ検出
  let browser = "不明"
  if (ua.includes("Firefox")) browser = "Firefox"
  else if (ua.includes("Edg")) browser = "Edge"
  else if (ua.includes("Chrome")) browser = "Chrome"
  else if (ua.includes("Safari")) browser = "Safari"
  else if (ua.includes("Opera")) browser = "Opera"

  // OS検出
  let os = "不明"
  if (ua.includes("Windows")) os = "Windows"
  else if (ua.includes("Mac")) os = "macOS"
  else if (ua.includes("Linux")) os = "Linux"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS"

  // デバイスタイプ検出
  let deviceType = "desktop"
  if (/Mobi|Android/i.test(ua)) deviceType = "mobile"
  else if (/Tablet|iPad/i.test(ua)) deviceType = "tablet"

  return { browser, os, deviceType, userAgent: ua }
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null)
  const [mfaCode, setMfaCode] = useState("")

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "パスワードは8文字以上である必要があります"
    }
    if (!/[a-z]/.test(password)) {
      return "パスワードには小文字を1文字以上含める必要があります"
    }
    if (!/[A-Z]/.test(password)) {
      return "パスワードには大文字を1文字以上含める必要があります"
    }
    if (!/[0-9]/.test(password)) {
      return "パスワードには数字を1文字以上含める必要があります"
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "パスワードには特殊文字を1文字以上含める必要があります"
    }
    return null
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setDisplayName("")
    setError(null)
    setMessage(null)
    setShowPassword(false)
    setShowConfirmPassword(false)
    setMfaRequired(false)
    setMfaFactorId(null)
    setMfaChallengeId(null)
    setMfaCode("")
  }

  const handleClose = () => {
    resetForm()
    setMode("login")
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setLoading(false)
        setError(error.message === "Invalid login credentials"
          ? "メールアドレスまたはパスワードが正しくありません"
          : error.message)
        return
      }

      // Check if MFA is enabled (skip on localhost for development)
      const isLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.startsWith('192.168.'))

      const mfaEnabled = process.env.NEXT_PUBLIC_ENABLE_MFA !== 'false' && !isLocalhost

      // Check if MFA is required by listing factors
      const { data: factorsData, error: factorsError } = await supabaseAuth.auth.mfa.listFactors()

      if (mfaEnabled && !factorsError && factorsData?.totp && factorsData.totp.length > 0) {
        const verifiedFactor = factorsData.totp.find(f => f.status === 'verified')
        if (verifiedFactor) {
          // Create MFA challenge
          const { data: challengeData, error: challengeError } = await supabaseAuth.auth.mfa.challenge({
            factorId: verifiedFactor.id
          })

          setLoading(false)

          if (challengeError) {
            setError("二段階認証のチャレンジ作成に失敗しました")
            return
          }

          setMfaFactorId(verifiedFactor.id)
          setMfaChallengeId(challengeData.id)
          setMfaRequired(true)
          return
        }
      }

      setLoading(false)

      // No MFA required, login successful
      // ログイン履歴を記録
      if (data.user) {
        const deviceInfo = getDeviceInfo()
        recordLoginHistory(data.user.id, {
          user_agent: deviceInfo.userAgent,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          success: true
        })
      }

      handleClose()
      onSuccess?.()
    } catch (err) {
      setLoading(false)
      setError("ログインに失敗しました")
    }
  }

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaFactorId || !mfaChallengeId || !mfaCode) return

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabaseAuth.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: mfaCode,
      })

      setLoading(false)

      if (error) {
        setError("認証コードが正しくありません")
        return
      }

      // MFA認証成功後、ログイン履歴を記録
      const { data: { user } } = await supabaseAuth.auth.getUser()
      if (user) {
        const deviceInfo = getDeviceInfo()
        recordLoginHistory(user.id, {
          user_agent: deviceInfo.userAgent,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          success: true
        })
      }

      handleClose()
      onSuccess?.()
    } catch (err) {
      setLoading(false)
      setError("認証に失敗しました")
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // パスワードバリデーション
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    // パスワード確認チェック
    if (password !== confirmPassword) {
      setError("パスワードが一致しません")
      setLoading(false)
      return
    }

    const { error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split("@")[0],
        },
        emailRedirectTo: `${window.location.origin}/blog`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage("確認メールを送信しました。メールを確認してアカウントを有効化してください。")
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/blog/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage("パスワードリセットメールを送信しました。メールを確認してください。")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl p-0 bg-card border-none overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>
            {mfaRequired ? "二段階認証" :
              mode === "login" ? "ログイン" :
                mode === "signup" ? "アカウント登録" :
                  "パスワードリセット"}
          </DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Left Side - Form */}
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              {/* Header */}
              <div className="mb-8">
                <p className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-foreground mb-4">
                  DON'T MISS A THING
                </p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-foreground leading-tight">
                  {mfaRequired ? "認証コードを入力" :
                    mode === "login" ? "Welcome back to our blog" :
                      mode === "signup" ? "Join our community" :
                        "Reset your password"}
                </h2>
              </div>

              {/* Success Message */}
              {message ? (
                <div className="space-y-6">
                  <p className="text-muted-foreground">{message}</p>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-foreground text-background font-semibold hover:opacity-90 transition-opacity"
                  >
                    閉じる
                  </button>
                </div>
              ) : (
                <form onSubmit={
                  mfaRequired ? handleVerifyMFA :
                    mode === "login" ? handleLogin :
                      mode === "signup" ? handleSignup :
                        handleForgotPassword
                } className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 p-3 text-sm">
                      {error}
                    </div>
                  )}

                  {/* MFA Code Input */}
                  {mfaRequired ? (
                    <div className="space-y-4">
                      <Input
                        type="text"
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        required
                        className="w-full py-3 px-4 border border-border text-center text-2xl font-mono tracking-wider"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      {/* Display Name (Signup only) */}
                      {mode === "signup" && (
                        <Input
                          type="text"
                          placeholder="DISPLAY NAME"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full py-3 px-4 border border-border"
                        />
                      )}

                      {/* Email Input */}
                      <Input
                        type="email"
                        placeholder="EMAIL ADDRESS"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full py-3 px-4 border border-border uppercase placeholder:text-muted-foreground"
                      />

                      {/* Password Input */}
                      {mode !== "forgot" && (
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="PASSWORD"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full py-3 px-4 pr-12 border border-border uppercase placeholder:text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                          >
                            {showPassword ? (
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
                      )}

                      {/* Confirm Password (Signup only) */}
                      {mode === "signup" && (
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="CONFIRM PASSWORD"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full py-3 px-4 pr-12 border border-border uppercase placeholder:text-muted-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
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
                      )}
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full py-3 bg-foreground text-background font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        処理中...
                      </>
                    ) : (
                      <>
                        {mfaRequired ? "確認" :
                          mode === "login" ? "Sign In" :
                            mode === "signup" ? "Sign Up" :
                              "Send Reset Link"}
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Links */}
                  <div className="space-y-3 text-center text-sm">
                    {mfaRequired ? (
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => { resetForm(); setMode("login") }}
                      >
                        ← ログイン画面に戻る
                      </button>
                    ) : mode === "login" ? (
                      <>
                        <button
                          type="button"
                          className="block w-full text-muted-foreground hover:text-foreground"
                          onClick={() => { resetForm(); setMode("forgot") }}
                        >
                          パスワードをお忘れですか？
                        </button>
                        <p className="text-muted-foreground">
                          アカウントをお持ちでない方は{" "}
                          <button
                            type="button"
                            className="text-foreground font-semibold hover:underline"
                            onClick={() => { resetForm(); setMode("signup") }}
                          >
                            新規登録
                          </button>
                        </p>
                      </>
                    ) : mode === "signup" ? (
                      <p className="text-muted-foreground">
                        既にアカウントをお持ちの方は{" "}
                        <button
                          type="button"
                          className="text-foreground font-semibold hover:underline"
                          onClick={() => { resetForm(); setMode("login") }}
                        >
                          ログイン
                        </button>
                      </p>
                    ) : (
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => { resetForm(); setMode("login") }}
                      >
                        ログインに戻る
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden md:block md:w-1/2 relative bg-primary">
            <Image
              src="/blog-placeholders/krystal-ng-1PlVbeOCd78.jpg"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
