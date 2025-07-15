"use client"

import { useState, useEffect, useCallback } from "react"
import { UserSettingsService } from "@/services/user-settings.service"
import type { UserSettings, Theme } from "@/types/database"
import { useAuth } from "./use-auth"

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSettings(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await UserSettingsService.get()
      setSettings(data)
    } catch (err: any) {
      setError(err.message || "設定の取得に失敗しました。")
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // リアルタイム更新の監視
  useEffect(() => {
    if (!user) return

    const subscription = UserSettingsService.subscribeToChanges(user.id, (payload) => {
      console.log("User settings changed:", payload)
      fetchSettings() // データを再取得
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchSettings])

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const updatedSettings = await UserSettingsService.update(updates)
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err: any) {
      setError(err.message || "設定の更新に失敗しました。")
      throw err
    }
  }

  const updateFontSize = async (fontSize: number) => {
    try {
      const updatedSettings = await UserSettingsService.updateFontSize(fontSize)
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err: any) {
      setError(err.message || "フォントサイズの更新に失敗しました。")
      throw err
    }
  }

  const toggleWeekStartsMonday = async () => {
    try {
      const updatedSettings = await UserSettingsService.toggleWeekStartsMonday()
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err: any) {
      setError(err.message || "週開始曜日の更新に失敗しました。")
      throw err
    }
  }

  const updateTheme = async (theme: Theme) => {
    try {
      const updatedSettings = await UserSettingsService.updateTheme(theme)
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err: any) {
      setError(err.message || "テーマの更新に失敗しました。")
      throw err
    }
  }

  const toggleNotifications = async () => {
    try {
      const updatedSettings = await UserSettingsService.toggleNotifications()
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err: any) {
      setError(err.message || "通知設定の更新に失敗しました。")
      throw err
    }
  }

  const updateReminderTime = async (time: string) => {
    try {
      const updatedSettings = await UserSettingsService.updateReminderTime(time)
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err: any) {
      setError(err.message || "リマインダー時間の更新に失敗しました。")
      throw err
    }
  }

  const updateGoogleCalendarConnection = async (connected: boolean) => {
    try {
      const updatedSettings = await UserSettingsService.updateGoogleCalendarConnection(connected)
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err: any) {
      setError(err.message || "Google Calendar連携の更新に失敗しました。")
      throw err
    }
  }

  const updateAppleCalendarConnection = async (connected: boolean) => {
    try {
      const updatedSettings = await UserSettingsService.updateAppleCalendarConnection(connected)
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err: any) {
      setError(err.message || "Apple Calendar連携の更新に失敗しました。")
      throw err
    }
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    updateFontSize,
    toggleWeekStartsMonday,
    updateTheme,
    toggleNotifications,
    updateReminderTime,
    updateGoogleCalendarConnection,
    updateAppleCalendarConnection,
    refetch: fetchSettings,
    clearError: () => setError(null),
  }
}
