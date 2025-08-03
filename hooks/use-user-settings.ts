"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { UserSettingsService } from "@/services/user-settings.service"
import { useToast } from "./use-toast"
import type { UserSettings } from "@/types/database"

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const userSettingsService = new UserSettingsService()

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSettings()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const loadSettings = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userSettings = await userSettingsService.getByUserId(user.id)
      setSettings(userSettings)
    } catch (error) {
      console.error("Error loading user settings:", error)
      // Create default settings if none exist
      try {
        const defaultSettings = await userSettingsService.create({
          user_id: user.id,
          font_size: 16,
          week_starts_monday: false,
          notifications_enabled: true,
          reminder_time: "20:00",
        })
        setSettings(defaultSettings)
      } catch (createError) {
        console.error("Error creating default settings:", createError)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateFontSize = async (fontSize: number) => {
    if (!settings) return

    try {
      const updatedSettings = await userSettingsService.update(settings.id, {
        font_size: fontSize,
      })
      setSettings(updatedSettings)
    } catch (error) {
      console.error("Error updating font size:", error)
      throw error
    }
  }

  const toggleWeekStartsMonday = async () => {
    if (!settings) return

    try {
      const updatedSettings = await userSettingsService.update(settings.id, {
        week_starts_monday: !settings.week_starts_monday,
      })
      setSettings(updatedSettings)
    } catch (error) {
      console.error("Error toggling week start:", error)
      throw error
    }
  }

  const toggleNotifications = async () => {
    if (!settings) return

    try {
      const updatedSettings = await userSettingsService.update(settings.id, {
        notifications_enabled: !settings.notifications_enabled,
      })
      setSettings(updatedSettings)
    } catch (error) {
      console.error("Error toggling notifications:", error)
      throw error
    }
  }

  const sendTestNotification = async () => {
    try {
      const response = await fetch("/api/send-test-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "テスト通知を送信しました",
          description: "メールをご確認ください。",
        })
      } else {
        toast({
          title: "エラーが発生しました",
          description: data.message || "テスト通知の送信に失敗しました。",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast({
        title: "エラーが発生しました",
        description: "テスト通知の送信に失敗しました。",
        variant: "destructive",
      })
    }
  }

  return {
    settings,
    loading,
    updateFontSize,
    toggleWeekStartsMonday,
    toggleNotifications,
    sendTestNotification,
  }
}
