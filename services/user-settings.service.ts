import type { SupabaseClient } from "@supabase/supabase-js"
import type { UserSettings, UserSettingsInsert, UserSettingsUpdate } from "@/types/database"
import { ApplicationError } from "@/lib/errors"
import { supabase } from "@/lib/supabase" // supabaseインスタンスをインポート

export class UserSettingsService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * ユーザー設定を取得（なければ作成）
   */
  static async get(supabase: SupabaseClient): Promise<UserSettings> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new ApplicationError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new ApplicationError("認証が必要です。ログインしてください。")
      }

      console.log("Fetching user settings for user:", user.id)

      // 既存の設定を取得
      const { data: existingSettings, error: fetchError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "No rows found"
        console.error("Database select error:", fetchError)
        throw new ApplicationError(`設定の読み込みに失敗しました: ${fetchError.message}`)
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
        // google_calendar_connected: false, // 削除
        // apple_calendar_connected: false, // 削除
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
        throw new ApplicationError("ユーザー設定の作成に失敗しました。")
      }

      console.log("Default user settings created:", newSettings)
      return newSettings
    } catch (error) {
      console.error("UserSettingsService.get error:", error)
      if (error instanceof ApplicationError) {
        throw error
      }
      throw new ApplicationError("設定の読み込み中に予期せぬエラーが発生しました。")
    }
  }

  /**
   * ユーザー設定を更新
   */
  async update(data: Partial<UserSettingsUpdate>): Promise<UserSettings> {
    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new ApplicationError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new ApplicationError("認証が必要です。ログインしてください。")
      }

      console.log("Updating user settings for user:", user.id, "data:", data)

      const updateData: Partial<UserSettingsUpdate> = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      const { data: settings, error } = await this.supabase
        .from("user_settings")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Database update error:", error)
        throw new ApplicationError(`設定の更新に失敗しました: ${error.message}`)
      }

      console.log("User settings updated successfully:", settings)
      return settings
    } catch (error) {
      console.error("UserSettingsService.update error:", error)
      if (error instanceof ApplicationError) {
        throw error
      }
      throw new ApplicationError("設定の更新中に予期せぬエラーが発生しました。")
    }
  }

  /**
   * フォントサイズを更新
   */
  static async updateFontSize(supabase: SupabaseClient, fontSize: number): Promise<UserSettings> {
    if (fontSize < 12 || fontSize > 24) {
      throw new ApplicationError("フォントサイズは12px〜24pxの範囲で設定してください。")
    }

    const service = new UserSettingsService(supabase)
    return service.update({ font_size: fontSize })
  }

  /**
   * 週の開始日を更新
   */
  static async updateWeekStartsMonday(supabase: SupabaseClient, weekStartsMonday: boolean): Promise<UserSettings> {
    const service = new UserSettingsService(supabase)
    return service.update({ week_starts_monday: weekStartsMonday })
  }

  /**
   * テーマを更新
   */
  static async updateTheme(supabase: SupabaseClient, theme: "light" | "dark" | "system"): Promise<UserSettings> {
    const service = new UserSettingsService(supabase)
    return service.update({ theme })
  }

  /**
   * 通知設定を更新
   */
  static async updateNotifications(
    supabase: SupabaseClient,
    enabled: boolean,
    reminderTime?: string,
  ): Promise<UserSettings> {
    const updateData: Partial<UserSettingsUpdate> = {
      notifications_enabled: enabled,
    }

    if (reminderTime) {
      updateData.reminder_time = reminderTime
    }

    const service = new UserSettingsService(supabase)
    return service.update(updateData)
  }

  /**
   * カレンダー連携設定を更新 (削除)
   */
  // static async updateCalendarIntegration(
  //   supabase: SupabaseClient,
  //   googleConnected?: boolean,
  //   appleConnected?: boolean,
  // ): Promise<UserSettings> {
  //   const updateData: Partial<UserSettingsUpdate> = {}

  //   if (googleConnected !== undefined) {
  //     updateData.google_calendar_connected = googleConnected
  //   }

  //   if (appleConnected !== undefined) {
  //     updateData.apple_calendar_connected = appleConnected
  //   }

  //   const service = new UserSettingsService(supabase)
  //   return service.update(updateData)
  // }

  /**
   * 設定をリセット
   */
  static async reset(supabase: SupabaseClient): Promise<UserSettings> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new ApplicationError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new ApplicationError("認証が必要です。ログインしてください。")
      }

      console.log("Resetting user settings for user:", user.id)

      const defaultSettings: Partial<UserSettingsUpdate> = {
        font_size: 16,
        week_starts_monday: false,
        // google_calendar_connected: false, // 削除
        // apple_calendar_connected: false, // 削除
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
        throw new ApplicationError(`設定のリセットに失敗しました: ${error.message}`)
      }

      console.log("User settings reset successfully:", settings)
      return settings
    } catch (error) {
      console.error("Unexpected error in UserSettingsService.reset:", error)
      throw new ApplicationError("設定のリセット中に予期せぬエラーが発生しました。")
    }
  }

  /**
   * ユーザー設定をアップサート（なければ作成、あれば更新）
   */
  static async upsert(data: Partial<UserSettings>): Promise<UserSettings> {
    if (!data.user_id) {
      throw new Error("user_idが必要です。")
    }

    const { data: settings, error } = await supabase
      .from("user_settings")
      .upsert(data, { onConflict: "user_id" })
      .select()
      .single()

    if (error) {
      throw error
    }
    return settings
  }
}
