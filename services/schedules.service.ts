import { supabase } from "@/lib/supabase"
import { handleSupabaseError, DatabaseError } from "@/lib/errors"
import type { Schedule, ScheduleInsert, ScheduleUpdate } from "@/types/database"

export class SchedulesService {
  /**
   * 全てのスケジュールを取得
   */
  static async getAll(): Promise<Schedule[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false })

      if (error) {
        handleSupabaseError(error)
      }
      return data || []
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * 特定のスケジュールを取得
   */
  static async getById(id: string): Promise<Schedule | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        handleSupabaseError(error)
      }
      return data || null
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * スケジュールを追加
   */
  static async create(schedule: ScheduleInsert): Promise<Schedule> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase
        .from("schedules")
        .insert({ ...schedule, user_id: user.id })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * スケジュールを更新
   */
  static async update(id: string, updates: ScheduleUpdate): Promise<Schedule> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase
        .from("schedules")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * スケジュールを削除
   */
  static async delete(id: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { error } = await supabase.from("schedules").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        handleSupabaseError(error)
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}
