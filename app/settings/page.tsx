"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useUserSettings } from "@/hooks/use-user-settings"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SettingsPage() {
  const { userSettings, loading, error, updateSetting, refetch } = useUserSettings()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (error) {
      toast({
        title: "設定の読み込みに失敗しました",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handleToggle = async (key: "notifications_enabled" | "weekly_report_enabled", value: boolean) => {
    try {
      await updateSetting({ [key]: value })
      toast({
        title: "設定を更新しました",
        description: "変更が保存されました。",
      })
    } catch (err: any) {
      toast({
        title: "設定の更新に失敗しました",
        description: err.message || "もう一度お試しください。",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">設定を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // リダイレクト中
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">設定</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium text-gray-800">通知設定</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              アプリからの通知の受け取り方を管理します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled" className="text-base">
                通知を有効にする
              </Label>
              <Switch
                id="notifications-enabled"
                checked={userSettings?.notifications_enabled ?? true} // デフォルトはtrue
                onCheckedChange={(checked) => handleToggle("notifications_enabled", checked)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weekly-report-enabled" className="text-base">
                週次レポートを受け取る
              </Label>
              <Switch
                id="weekly-report-enabled"
                checked={userSettings?.weekly_report_enabled ?? false} // デフォルトはfalse
                onCheckedChange={(checked) => handleToggle("weekly_report_enabled", checked)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* 他の設定項目をここに追加 */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium text-gray-800">アカウント</CardTitle>
            <CardDescription className="text-sm text-gray-500">アカウント情報を管理します。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              パスワードを変更
            </Button>
            {/* <Button variant="destructive" className="w-full mt-2">
              アカウントを削除
            </Button> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
