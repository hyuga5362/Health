"use client"

import { useState, useEffect } from "react"
import { localStorageAPI, type UserSettings } from "@/lib/local-storage"

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = () => {
    try {
      const data = localStorageAPI.getUserSettings()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching user settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (updates: Partial<UserSettings>) => {
    try {
      const updatedSettings = localStorageAPI.saveUserSettings(updates)
      setSettings(updatedSettings)
      return updatedSettings
    } catch (error) {
      console.error("Error updating user settings:", error)
      throw error
    }
  }

  const updateFontSize = (fontSize: number) => {
    return updateSettings({ font_size: fontSize })
  }

  const toggleWeekStartsMonday = () => {
    if (!settings) return
    return updateSettings({ week_starts_monday: !settings.week_starts_monday })
  }

  const updateTheme = (theme: "light" | "dark" | "system") => {
    return updateSettings({ theme })
  }

  const toggleNotifications = () => {
    if (!settings) return
    return updateSettings({ notifications_enabled: !settings.notifications_enabled })
  }

  const updateReminderTime = (time: string) => {
    return updateSettings({ reminder_time: time })
  }

  const connectGoogleCalendar = () => {
    // Google Calendar連携のロジックをここに実装
    return updateSettings({ google_calendar_connected: true })
  }

  const disconnectGoogleCalendar = () => {
    return updateSettings({ google_calendar_connected: false })
  }

  const connectAppleCalendar = () => {
    // Apple Calendar連携のロジックをここに実装
    return updateSettings({ apple_calendar_connected: true })
  }

  const disconnectAppleCalendar = () => {
    return updateSettings({ apple_calendar_connected: false })
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    updateFontSize,
    toggleWeekStartsMonday,
    updateTheme,
    toggleNotifications,
    updateReminderTime,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    connectAppleCalendar,
    disconnectAppleCalendar,
    refetch: fetchSettings,
  }
}
