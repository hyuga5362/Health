import { supabase } from "@/lib/supabase"
import { handleSupabaseError, DatabaseError } from "@/lib/errors"
import type { UserSettings, UserSettingsInsert, UserSettingsUpdate } from "@/types/database"

export class UserSettingsService {
  /**
   * ユーザー設定を取得（なければ作成）
   */
  static async get(): Promise<UserSettings> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      // 既存の設定を取得
      const { data: existingSettings, error: fetchError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        handleSupabaseError(fetchError)
      }

      // 設定が存在する場合は返す
      if (existingSettings) {
        return existingSettings
      }

      // 設定が存在しない場合は初期設定を作成
      const defaultSettings: UserSettingsInsert = {
        user_id: user.id,
        font_size: 16,
        week_starts_monday: false,
        google_calendar_connected: false,
        apple_calendar_connected: false,
        theme: "light",
        notifications_enabled: true,
        reminder_time: "09:00:00",
      }

      const { data: newSettings, error: createError } = await supabase
        .from("user_settings")
        .insert(defaultSettings)
        .select()
        .single()

      if (createError) {
        handleSupabaseError(createError)
      }

      return newSettings
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * ユーザー設定を更新
   */
  static async update(data: Partial<UserSettingsUpdate>): Promise<UserSettings> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: settings, error } = await supabase
        .from("user_settings")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }

      return settings
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * フォントサイズを更新
   */
  static async updateFontSize(fontSize: number): Promise<UserSettings> {
    if (fontSize < 12 || fontSize > 24) {
      throw new DatabaseError("フォントサイズは12px〜24pxの範囲で設定してください。")
    }

    return this.update({ font_size: fontSize })
  }

  /**
   * 週の開始日を更新
   */
  static async updateWeekStartsMonday(weekStartsMonday: boolean): Promise<UserSettings> {
    return this.update({ week_starts_monday: weekStartsMonday })
  }

  /**
   * テーマを更新
   */
  static async updateTheme(theme: "light" | "dark" | "system"): Promise<UserSettings> {
    return this.update({ theme })
  }

  /**
   * 通知設定を更新
   */
  static async updateNotifications(enabled: boolean, reminderTime?: string): Promise<UserSettings> {
    const updateData: Partial<UserSettingsUpdate> = {
      notifications_enabled: enabled,
    }

    if (reminderTime) {
      updateData.reminder_time = reminderTime
    }

    return this.update(updateData)
  }

  /**
   * カレンダー連携設定を更新
   */
  static async updateCalendarIntegration(googleConnected?: boolean, appleConnected?: boolean): Promise<UserSettings> {
    const updateData: Partial<UserSettingsUpdate> = {}

    if (googleConnected !== undefined) {
      updateData.google_calendar_connected = googleConnected
    }

    if (appleConnected !== undefined) {
      updateData.apple_calendar_connected = appleConnected
    }

    return this.update(updateData)
  }

  /**
   * 設定をリセット
   */
  static async reset(): Promise<UserSettings> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const defaultSettings: Partial<UserSettingsUpdate> = {
        font_size: 16,
        week_starts_monday: false,
        google_calendar_connected: false,
        apple_calendar_connected: false,
        theme: "light",
        notifications_enabled: true,
        reminder_time: "09:00:00",
        updated_at: new Date().toISOString(),
      }

      const { data: settings, error } = await supabase
        .from("user_settings")
        .update(defaultSettings)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }

      return settings
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}
