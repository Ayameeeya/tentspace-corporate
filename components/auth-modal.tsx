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
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setDisplayName("")
    setError(null)
    setMessage(null)
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

    const { error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message === "Invalid login credentials" 
        ? "メールアドレスまたはパスワードが正しくありません" 
        : error.message)
      return
    }

    handleClose()
    onSuccess?.()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === "login" && "ログイン"}
            {mode === "signup" && "アカウント登録"}
            {mode === "forgot" && "パスワードリセット"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login" && "メールアドレスとパスワードでログインしてください"}
            {mode === "signup" && "新しいアカウントを作成します"}
            {mode === "forgot" && "登録したメールアドレスを入力してください"}
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

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">表示名</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="ニックネーム"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
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
                    {mode === "login" && "ログイン"}
                    {mode === "signup" && "登録する"}
                    {mode === "forgot" && "リセットメールを送信"}
                  </>
                )}
              </Button>

              {mode === "login" && (
                <>
                  <button
                    type="button"
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => { resetForm(); setMode("forgot") }}
                  >
                    パスワードをお忘れですか？
                  </button>
                  <div className="text-center text-sm text-gray-500">
                    アカウントをお持ちでない方は{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline font-medium"
                      onClick={() => { resetForm(); setMode("signup") }}
                    >
                      新規登録
                    </button>
                  </div>
                </>
              )}

              {mode === "signup" && (
                <div className="text-center text-sm text-gray-500">
                  既にアカウントをお持ちの方は{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => { resetForm(); setMode("login") }}
                  >
                    ログイン
                  </button>
                </div>
              )}

              {mode === "forgot" && (
                <button
                  type="button"
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
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

