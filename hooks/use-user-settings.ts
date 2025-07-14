"use client"

import { useState, useEffect } from "react"
import { supabase, type UserSettings, initializeUserSettings } from "@/lib/supabase"

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

      if (error) {
        if (error.code === "PGRST116") {
          // 設定が存在しない場合は初期化
          const newSettings = await initializeUserSettings()
          setSettings(newSettings)
        } else {
          throw error
        }
      } else {
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching user settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("user_settings")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error
      setSettings(data)
      return data
    } catch (error) {
      console.error("Error updating user settings:", error)
      throw error
    }
  }

  const updateFontSize = async (fontSize: number) => {
    return updateSettings({ font_size: fontSize })
  }

  const toggleWeekStartsMonday = async () => {
    if (!settings) return
    return updateSettings({ week_starts_monday: !settings.week_starts_monday })
  }

  const updateTheme = async (theme: "light" | "dark" | "system") => {
    return updateSettings({ theme })
  }

  const toggleNotifications = async () => {
    if (!settings) return
    return updateSettings({ notifications_enabled: !settings.notifications_enabled })
  }

  const updateReminderTime = async (time: string) => {
    return updateSettings({ reminder_time: time })
  }

  const connectGoogleCalendar = async () => {
    // Google Calendar連携のロジックをここに実装
    return updateSettings({ google_calendar_connected: true })
  }

  const disconnectGoogleCalendar = async () => {
    return updateSettings({ google_calendar_connected: false })
  }

  const connectAppleCalendar = async () => {
    // Apple Calendar連携のロジックをここに実装
    return updateSettings({ apple_calendar_connected: true })
  }

  const disconnectAppleCalendar = async () => {
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
