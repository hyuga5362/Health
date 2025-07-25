"use client"

import { useState, useEffect, useCallback } from "react"
import { UserSettingsService } from "@/services/user-settings.service"
import { supabase } from "@/lib/supabase" // supabaseインスタンスをインポート
import { useAuth } from "./use-auth"
import type { UserSettings } from "@/types/database"
import { ApplicationError } from "@/lib/errors"

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

  // カレンダー連携関連の関数は削除

  return {
    settings,
    loading,
    error,
    updateSettings,
    fetchSettings,
    updateFontSize,
    toggleWeekStartsMonday,
    toggleNotifications,
    // カレンダー連携関連の関数は返さない
  }
}
