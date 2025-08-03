"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from "@/lib/supabase"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/")
    }
  }, [authLoading, isAuthenticated, router])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "入力エラー",
        description: "メールアドレスとパスワードを入力してください。",
        variant: "destructive",
      })
      return
    }

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "パスワードエラー",
        description: "パスワードが一致しません。",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        await signInWithEmail(email, password)
        toast({
          title: "ログイン成功",
          description: "健康カレンダーへようこそ！",
        })
      } else {
        await signUpWithEmail(email, password)
        toast({
          title: "アカウント作成成功",
          description: "確認メールをお送りしました。メールを確認してアカウントを有効化してください。",
        })
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "エラーが発生しました。もう一度お試しください。"
      toast({
        title: isLogin ? "ログインエラー" : "アカウント作成エラー",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Googleログインに失敗しました。"
      toast({
        title: "Googleログインエラー",
        description: errorMessage,
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // リダイレクト中
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-800">健康カレンダー</h1>
          </div>
          <CardTitle className="text-lg">{isLogin ? "ログイン" : "アカウント作成"}</CardTitle>
          <p className="text-sm text-gray-600">
            {isLogin ? "アカウントにログインしてください" : "新しいアカウントを作成してください"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google認証 */}
          <Button onClick={handleGoogleAuth} disabled={loading} variant="outline" className="w-full bg-transparent">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleでログイン
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">または</span>
            </div>
          </div>

          {/* メール認証フォーム */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">パスワード確認</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="パスワードを再入力"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  処理中...
                </div>
              ) : isLogin ? (
                "ログイン"
              ) : (
                "アカウント作成"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-600">
              {isLogin ? "アカウントをお持ちでない方はこちら" : "既にアカウントをお持ちの方はこちら"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
