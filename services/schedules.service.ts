import { supabase } from "@/lib/supabase"
import { handleSupabaseError, DatabaseError } from "@/lib/errors"
import type { Schedule, ScheduleInsert, ScheduleUpdate } from "@/types/database"

export class SchedulesService {
  /**
   * スケジュールを作成
   */
  static async create(data: Omit<ScheduleInsert, "user_id">): Promise<Schedule> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: schedule, error } = await supabase
        .from("schedules")
        .insert({
          ...data,
          user_id: user.id,
          calendar_source: data.calendar_source || "manual",
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }

      return schedule
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * スケジュールを取得（ユーザー別）
   */
  static async getAll(): Promise<Schedule[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: schedules, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })

      if (error) {
        handleSupabaseError(error)
      }

      return schedules || []
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * 特定の日付のスケジュールを取得
   */
  static async getByDate(date: string): Promise<Schedule[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: schedules, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
        .order("start_time", { ascending: true })

      if (error) {
        handleSupabaseError(error)
      }

      return schedules || []
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * 期間別のスケジュールを取得
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<Schedule[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: schedules, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })

      if (error) {
        handleSupabaseError(error)
      }

      return schedules || []
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * スケジュールを更新
   */
  static async update(id: string, data: ScheduleUpdate): Promise<Schedule> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: schedule, error } = await supabase
        .from("schedules")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }

      return schedule
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

  /**
   * 外部カレンダーからスケジュールを同期
   */
  static async syncFromExternalCalendar(source: string, schedules: Omit<ScheduleInsert, "user_id">[]): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      // 既存の外部カレンダーのスケジュールを削除
      await supabase.from("schedules").delete().eq("user_id", user.id).eq("calendar_source", source)

      // 新しいスケジュールを挿入
      if (schedules.length > 0) {
        const schedulesWithUserId = schedules.map((schedule) => ({
          ...schedule,
          user_id: user.id,
          calendar_source: source,
        }))

        const { error } = await supabase.from("schedules").insert(schedulesWithUserId)

        if (error) {
          handleSupabaseError(error)
        }
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}
