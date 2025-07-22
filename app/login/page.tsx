"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
        toast({
          title: "登録完了",
          description: "確認メールを送信しました。メールをご確認ください。",
        })
      } else {
        await signIn(email, password)
        toast({
          title: "ログイン成功",
          description: "健康カレンダーへようこそ！",
        })
        router.push("/")
      }
    } catch (error: any) {
      toast({
        title: "エラーが発生しました",
        description: error.message || "操作に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">{isSignUp ? "新規登録" : "ログイン"}</CardTitle>
          <CardDescription className="text-gray-600">
            {isSignUp ? "アカウントを作成して始めましょう" : "メールアドレスとパスワードでログイン"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
              {loading ? (isSignUp ? "登録中..." : "ログイン中...") : isSignUp ? "登録" : "ログイン"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            {isSignUp ? "アカウントをお持ちですか？" : "アカウントをお持ちではありませんか？"}{" "}
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="p-0 h-auto text-orange-600">
              {isSignUp ? "ログイン" : "新規登録"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
