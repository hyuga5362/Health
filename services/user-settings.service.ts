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
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("User authentication error:", userError)
      throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
    }

    if (!user) {
      throw new DatabaseError("認証が必要です。ログインしてください。")
    }

    console.log("Fetching user settings for user:", user.id)

    // 既存の設定を取得
    const { data: existingSettings, error: fetchError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (fetchError) {
      console.error("Database select error:", fetchError)
      handleSupabaseError(fetchError)
    }

    if (existingSettings) {
      console.log("User settings found:", existingSettings)
      return existingSettings
    }

    console.log("User settings not found, creating default settings")

    // Supabaseのテーブルの定義に合わせて「created_at」「updated_at」を抜く
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

    console.log("★ INSERTするデータ:", defaultSettings)

    const { data: newSettings, error: createError } = await supabase
      .from("user_settings")
      .insert(defaultSettings)
      .select()
      .single()

    if (createError) {
      console.error("★★ Database insert error detail:", createError)
      throw new DatabaseError("ユーザー設定の作成に失敗しました。")
    }

    console.log("Default user settings created:", newSettings)
    return newSettings
  } catch (error) {
    console.error("UserSettingsService.get error:", error)
    if (error instanceof DatabaseError) {
      throw error
    }
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
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Updating user settings for user:", user.id, "data:", data)

      const updateData: Partial<UserSettingsUpdate> = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      const { data: settings, error } = await supabase
        .from("user_settings")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Database update error:", error)
        handleSupabaseError(error)
      }

      console.log("User settings updated successfully:", settings)
      return settings
    } catch (error) {
      console.error("UserSettingsService.update error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
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
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Resetting user settings for user:", user.id)

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
        console.error("Database update error:", error)
        handleSupabaseError(error)
      }

      console.log("User settings reset successfully:", settings)
      return settings
    } catch (error) {
      console.error("UserSettingsService.reset error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }
}
