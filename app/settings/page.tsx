"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Palette, Bell, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useUserSettings } from "@/hooks/use-user-settings"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function SettingsPage() {
  const { settings, loading, updateFontSize, toggleWeekStartsMonday, toggleNotifications, sendTestNotification } =
    useUserSettings()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  const handleFontSizeChange = async (value: number[]) => {
    try {
      await updateFontSize(value[0])
      toast({
        title: "設定を更新しました",
        description: `フォントサイズを${value[0]}pxに変更しました。`,
      })
    } catch {
      toast({
        title: "エラーが発生しました",
        description: "設定の更新に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleWeekStartToggle = async () => {
    try {
      await toggleWeekStartsMonday()
      toast({
        title: "設定を更新しました",
        description: `週の開始を${settings?.week_starts_monday ? "日曜日" : "月曜日"}に変更しました。`,
      })
    } catch {
      toast({
        title: "エラーが発生しました",
        description: "設定の更新に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleNotificationToggle = async () => {
    try {
      await toggleNotifications()
      toast({
        title: "設定を更新しました",
        description: `通知を${settings?.notifications_enabled ? "無効" : "有効"}にしました。`,
      })
    } catch {
      toast({
        title: "エラーが発生しました",
        description: "設定の更新に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleSendTestNotification = async () => {
    await sendTestNotification()
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

  if (!settings) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">設定の読み込みに失敗しました。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-orange-600" />
              <h1 className="text-lg font-semibold text-gray-800">設定</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* User Info */}
        {user && (
          <Card className="bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
                <User className="h-4 w-4" />
                ユーザー情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">メールアドレス</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ユーザーID</span>
                  <span className="font-medium text-xs">{user.id.slice(0, 8)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 表示設定 */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              表示設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* フォントサイズ */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">フォントサイズ: {settings.font_size}px</Label>
              <Slider
                value={[settings.font_size]}
                onValueChange={handleFontSizeChange}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>小 (12px)</span>
                <span>大 (24px)</span>
              </div>
            </div>

            {/* 週の開始曜日 */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">週の開始曜日</Label>
                <p className="text-xs text-gray-500">
                  {settings.week_starts_monday ? "月曜日から開始" : "日曜日から開始"}
                </p>
              </div>
              <Switch checked={settings.week_starts_monday} onCheckedChange={handleWeekStartToggle} />
            </div>
          </CardContent>
        </Card>

        {/* 通知設定 */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              通知設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">体調記録リマインダー</Label>
                <p className="text-xs text-gray-500">毎日決まった時間に通知を送信</p>
              </div>
              <Switch checked={settings.notifications_enabled} onCheckedChange={handleNotificationToggle} />
            </div>

            {settings.notifications_enabled && (
              <div className="space-y-2 pl-4 border-l-2 border-orange-200">
                <Label className="text-sm font-medium text-gray-700">通知時間</Label>
                <p className="text-sm text-gray-600">{settings.reminder_time}</p>
                <p className="text-xs text-gray-500">※ 時間の変更機能は今後実装予定です</p>
              </div>
            )}
            <Button onClick={handleSendTestNotification} className="w-full bg-orange-600 hover:bg-orange-700">
              テスト通知を送信
            </Button>
          </CardContent>
        </Card>

        {/* アプリ情報 */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              アプリ情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">バージョン</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">データベース</span>
                <span className="font-medium">Supabase</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">認証</span>
                <span className="font-medium">Email/Google</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
