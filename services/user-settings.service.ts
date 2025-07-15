import { supabase } from "@/lib/supabase"
import { handleSupabaseError, DatabaseError, ValidationError, validateTheme } from "@/lib/errors"
import type { UserSettings, UserSettingsInsert, UserSettingsUpdate, Theme } from "@/types/database"

export class UserSettingsService {
  /**
   * ユーザー設定を作成（初期化）
   */
  static async create(data: Partial<Omit<UserSettingsInsert, "user_id">> = {}): Promise<UserSettings> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      // デフォルト設定
      const defaultSettings: UserSettingsInsert = {
        user_id: user.id,
        font_size: 16,
        week_starts_monday: false,
        google_calendar_connected: false,
        apple_calendar_connected: false,
        theme: "light",
        notifications_enabled: true,
        reminder_time: "09:00:00",
        ...data,
      }

      // バリデーション
      if (defaultSettings.font_size && (defaultSettings.font_size < 12 || defaultSettings.font_size > 24)) {
        throw new ValidationError("フォントサイズは12から24の間で設定してください。", "font_size")
      }

      if (defaultSettings.theme && !validateTheme(defaultSettings.theme)) {
        throw new ValidationError("有効なテーマを選択してください。", "theme")
      }

      const { data: settings, error } = await supabase.from("user_settings").insert(defaultSettings).select().single()

      if (error) {
        handleSupabaseError(error)
      }

      return settings
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * ユーザー設定を取得
   */
  static async get(): Promise<UserSettings | null> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

      if (error) {
        if (error.code === "PGRST116") {
          // 設定が存在しない場合は初期化
          return await this.create()
        }
        handleSupabaseError(error)
      }

      return data
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * ユーザー設定を更新
   */
  static async update(data: UserSettingsUpdate): Promise<UserSettings> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      // バリデーション
      if (data.font_size !== undefined && (data.font_size < 12 || data.font_size > 24)) {
        throw new ValidationError("フォントサイズは12から24の間で設定してください。", "font_size")
      }

      if (data.theme !== undefined && !validateTheme(data.theme)) {
        throw new ValidationError("有効なテーマを選択してください。", "theme")
      }

      const { data: settings, error } = await supabase
        .from("user_settings")
        .update(data)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }

      return settings
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * フォントサイズを更新
   */
  static async updateFontSize(fontSize: number): Promise<UserSettings> {
    return this.update({ font_size: fontSize })
  }

  /**
   * 週の開始曜日を切り替え
   */
  static async toggleWeekStartsMonday(): Promise<UserSettings> {
    try {
      const currentSettings = await this.get()
      if (!currentSettings) {
        throw new DatabaseError("設定が見つかりません。")
      }

      return this.update({ week_starts_monday: !currentSettings.week_starts_monday })
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * テーマを更新
   */
  static async updateTheme(theme: Theme): Promise<UserSettings> {
    return this.update({ theme })
  }

  /**
   * 通知設定を切り替え
   */
  static async toggleNotifications(): Promise<UserSettings> {
    try {
      const currentSettings = await this.get()
      if (!currentSettings) {
        throw new DatabaseError("設定が見つかりません。")
      }

      return this.update({ notifications_enabled: !currentSettings.notifications_enabled })
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * リマインダー時間を更新
   */
  static async updateReminderTime(time: string): Promise<UserSettings> {
    // 時間形式のバリデーション
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      throw new ValidationError("有効な時間形式（HH:MM:SS）で入力してください。", "reminder_time")
    }

    return this.update({ reminder_time: time })
  }

  /**
   * Google Calendar連携を更新
   */
  static async updateGoogleCalendarConnection(connected: boolean): Promise<UserSettings> {
    return this.update({ google_calendar_connected: connected })
  }

  /**
   * Apple Calendar連携を更新
   */
  static async updateAppleCalendarConnection(connected: boolean): Promise<UserSettings> {
    return this.update({ apple_calendar_connected: connected })
  }

  /**
   * ユーザー設定を削除
   */
  static async delete(): Promise<void> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { error } = await supabase.from("user_settings").delete().eq("user_id", user.id)

      if (error) {
        handleSupabaseError(error)
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * リアルタイム変更を監視
   */
  static subscribeToChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel("user_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_settings",
          filter: `user_id=eq.${userId}`,
        },
        callback,
      )
      .subscribe()
  }
}
