"use client"

import { useState } from "react"
import { supabaseAuth } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type AuthMode = "login" | "signup" | "forgot"

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
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {mfaRequired ? "二段階認証" : 
              mode === "login" ? "ログイン" :
              mode === "signup" ? "アカウント登録" :
              "パスワードリセット"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {mfaRequired ? "認証アプリに表示されている6桁のコードを入力してください" :
              mode === "login" ? "メールアドレスとパスワードでログインしてください" :
              mode === "signup" ? "新しいアカウントを作成します" :
              "登録したメールアドレスを入力してください"}
          </DialogDescription>
        </DialogHeader>

        {message ? (
          <div className="py-4">
            <div className="bg-green-50 text-green-800 rounded-lg p-4 text-sm">
              {message}
            </div>
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={handleClose}
            >
              閉じる
            </Button>
          </div>
        ) : (
          <form onSubmit={
            mfaRequired ? handleVerifyMFA :
            mode === "login" ? handleLogin :
            mode === "signup" ? handleSignup :
            handleForgotPassword
          }>
            <div className="space-y-4 py-4">
              {error && (
                <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              {mfaRequired ? (
                // MFA Code Input
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 mb-2">
                      認証アプリ（Google Authenticator、Authyなど）に表示されている6桁のコードを入力してください
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mfaCode" className="text-gray-700">認証コード</Label>
                    <Input
                      id="mfaCode"
                      type="text"
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                      className="text-center text-2xl font-mono tracking-wider bg-white border-gray-300 text-gray-900"
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                // Normal login/signup/forgot form
                <>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-gray-700">表示名</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="ニックネーム"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">パスワード</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pr-10 bg-white border-gray-300 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                  {mode === "signup" && (
                    <p className="text-xs text-gray-500 mt-1">
                      8文字以上、小文字・大文字・数字・特殊文字をそれぞれ1文字以上含める必要があります
                    </p>
                  )}
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">パスワード（確認）</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pr-10 bg-white border-gray-300 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                </div>
              )}
              </>
            )}
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    処理中...
                  </span>
                ) : (
                  <>
                    {mfaRequired ? "確認" :
                      mode === "login" ? "ログイン" :
                      mode === "signup" ? "登録する" :
                      "リセットメールを送信"}
                  </>
                )}
              </Button>

              {mfaRequired ? (
                <button
                  type="button"
                  className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={() => { resetForm(); setMode("login") }}
                >
                  ← ログイン画面に戻る
                </button>
              ) : mode === "login" ? (
                <>
                  <button
                    type="button"
                    className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => { resetForm(); setMode("forgot") }}
                  >
                    パスワードをお忘れですか？
                  </button>
                  <div className="text-center text-sm text-gray-600">
                    アカウントをお持ちでない方は{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      onClick={() => { resetForm(); setMode("signup") }}
                    >
                      新規登録
                    </button>
                  </div>
                </>
              ) : null}

              {mode === "signup" && (
                <div className="text-center text-sm text-gray-600">
                  既にアカウントをお持ちの方は{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    onClick={() => { resetForm(); setMode("login") }}
                  >
                    ログイン
                  </button>
                </div>
              )}

              {mode === "forgot" && (
                <button
                  type="button"
                  className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={() => { resetForm(); setMode("login") }}
                >
                  ログインに戻る
                </button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

