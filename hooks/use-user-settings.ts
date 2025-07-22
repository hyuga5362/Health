"use client"

import { useState, useEffect } from "react"
import { UserSettingsService } from "@/services/user-settings.service"
import { getErrorMessage, logError } from "@/lib/errors"
import { useAuth } from "./use-auth"
import type { UserSettings } from "@/types/database"

interface UserSettingsState {
  settings: UserSettings | null
  loading: boolean
  error: string | null
}

export function useUserSettings() {
  const { isAuthenticated, user } = useAuth()
  const [state, setState] = useState<UserSettingsState>({
    settings: null,
    loading: false,
    error: null,
  })

  // 設定を取得
  const fetchSettings = async () => {
    if (!isAuthenticated) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const settings = await UserSettingsService.get()
      setState({
        settings,
        loading: false,
        error: null,
      })
    } catch (error) {
      logError(error, "useUserSettings.fetchSettings")
      console.error("Error fetching settings in useUserSettings:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error),
      }))
    }
  }

  // 認証状態が変わったら設定を取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings()
    } else {
      setState({
        settings: null,
        loading: false,
        error: null,
      })
    }
  }, [isAuthenticated, user?.id])

  // フォントサイズを更新
  const updateFontSize = async (fontSize: number) => {
    try {
      const settings = await UserSettingsService.updateFontSize(fontSize)
      setState((prev) => ({ ...prev, settings, error: null }))
      return settings
    } catch (error) {
      logError(error, "useUserSettings.updateFontSize")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // 週の開始日を更新
  const updateWeekStartsMonday = async (weekStartsMonday: boolean) => {
    try {
      const settings = await UserSettingsService.updateWeekStartsMonday(weekStartsMonday)
      setState((prev) => ({ ...prev, settings, error: null }))
      return settings
    } catch (error) {
      logError(error, "useUserSettings.updateWeekStartsMonday")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // テーマを更新
  const updateTheme = async (theme: "light" | "dark" | "system") => {
    try {
      const settings = await UserSettingsService.updateTheme(theme)
      setState((prev) => ({ ...prev, settings, error: null }))
      return settings
    } catch (error) {
      logError(error, "useUserSettings.updateTheme")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // 通知設定を更新
  const updateNotifications = async (enabled: boolean, reminderTime?: string) => {
    try {
      const settings = await UserSettingsService.updateNotifications(enabled, reminderTime)
      setState((prev) => ({ ...prev, settings, error: null }))
      return settings
    } catch (error) {
      logError(error, "useUserSettings.updateNotifications")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // カレンダー連携設定を更新
  const updateCalendarIntegration = async (googleConnected?: boolean, appleConnected?: boolean) => {
    try {
      const settings = await UserSettingsService.updateCalendarIntegration(googleConnected, appleConnected)
      setState((prev) => ({ ...prev, settings, error: null }))
      return settings
    } catch (error) {
      logError(error, "useUserSettings.updateCalendarIntegration")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // 設定をリセット
  const resetSettings = async () => {
    try {
      const settings = await UserSettingsService.reset()
      setState((prev) => ({ ...prev, settings, error: null }))
      return settings
    } catch (error) {
      logError(error, "useUserSettings.resetSettings")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // エラーをクリア
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }))
  }

  return {
    settings: state.settings,
    loading: state.loading,
    error: state.error,
    updateFontSize,
    updateWeekStartsMonday,
    updateTheme,
    updateNotifications,
    updateCalendarIntegration,
    resetSettings,
    refetch: fetchSettings,
    clearError,
  }
}
