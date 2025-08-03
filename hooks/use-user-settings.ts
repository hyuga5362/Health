"use client"

import { useState, useEffect, useCallback } from "react"
import { UserSettingsService } from "@/services/user-settings.service"
import { supabase } from "@/lib/supabase" // supabaseインスタンスをインポート
import { useAuth } from "./use-auth"
import type { UserSettings } from "@/types/database"
import { ApplicationError } from "@/lib/errors"
import { toast } from "@/components/ui/use-toast" // toastをインポート

export function useUserSettings() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApplicationError | null>(null)

  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const fetchedSettings = await UserSettingsService.get(supabase)
      setSettings(fetchedSettings)
    } catch (err: any) {
      console.error("Failed to fetch user settings:", err)
      setError(err instanceof ApplicationError ? err : new ApplicationError("設定の読み込みに失敗しました。"))
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id]) // supabaseを依存配列に追加

  useEffect(() => {
    if (!authLoading) {
      fetchSettings()
    }
  }, [authLoading, fetchSettings])

  const updateSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      if (!isAuthenticated || !user?.id) {
        setError(new ApplicationError("認証されていません。"))
        return null
      }
      setLoading(true)
      setError(null)
      try {
        const updatedSettings = await UserSettingsService.upsert({ ...newSettings, user_id: user.id })
        setSettings(updatedSettings)
        return updatedSettings
      } catch (err: any) {
        console.error("Failed to update user settings:", err)
        setError(err instanceof ApplicationError ? err : new ApplicationError("設定の更新に失敗しました。"))
        return null
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, user?.id],
  )

  // フォントサイズを更新
  const updateFontSize = useCallback(
    async (fontSize: number) => {
      return updateSettings({ font_size: fontSize })
    },
    [updateSettings],
  )

  // 週の開始日を更新
  const toggleWeekStartsMonday = useCallback(async () => {
    if (!settings) return null
    return updateSettings({ week_starts_monday: !settings.week_starts_monday })
  }, [settings, updateSettings])

  // 通知設定を更新
  const toggleNotifications = useCallback(async () => {
    if (!settings) return null
    return updateSettings({ notifications_enabled: !settings.notifications_enabled })
  }, [settings, updateSettings])

  // テスト通知を送信
  const sendTestNotification = useCallback(async () => {
    if (!user?.id || !user?.email) {
      toast({
        title: "エラー",
        description: "テスト通知を送信するにはユーザー情報が必要です。",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/send-test-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "テスト通知を送信しました",
          description: data.message,
        })
      } else {
        throw new Error(data.message || "Failed to send test notification.")
      }
    } catch (error: any) {
      console.error("Failed to send test notification:", error)
      toast({
        title: "エラーが発生しました",
        description: `テスト通知の送信に失敗しました: ${error.message}`,
        variant: "destructive",
      })
    }
  }, [user?.id, user?.email])

  return {
    settings,
    loading,
    error,
    updateSettings,
    fetchSettings,
    updateFontSize,
    toggleWeekStartsMonday,
    toggleNotifications,
    sendTestNotification, // 新しく追加
  }
}
