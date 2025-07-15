import { supabase } from "@/lib/supabase"
import { handleSupabaseError, DatabaseError, ValidationError } from "@/lib/errors"
import type { Schedule, ScheduleInsert, ScheduleUpdate } from "@/types/database"

export interface ScheduleFilters {
  startDate?: string
  endDate?: string
  calendarSource?: string
  limit?: number
  offset?: number
}

export class SchedulesService {
  /**
   * スケジュールを作成
   */
  static async create(data: Omit<ScheduleInsert, "user_id">): Promise<Schedule> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      // バリデーション
      if (!data.title?.trim()) {
        throw new ValidationError("タイトルは必須です。", "title")
      }

      if (!data.start_date) {
        throw new ValidationError("開始日時は必須です。", "start_date")
      }

      const insertData: ScheduleInsert = {
        ...data,
        user_id: user.id,
        calendar_source: data.calendar_source || "manual",
      }

      const { data: schedule, error } = await supabase.from("schedules").insert(insertData).select().single()

      if (error) {
        handleSupabaseError(error)
      }

      return schedule
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * スケジュールを取得（フィルター付き）
   */
  static async getAll(filters: ScheduleFilters = {}): Promise<Schedule[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      let query = supabase.from("schedules").select("*").eq("user_id", user.id).order("start_date", { ascending: true })

      // フィルターを適用
      if (filters.startDate) {
        query = query.gte("start_date", filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte("start_date", filters.endDate)
      }

      if (filters.calendarSource) {
        query = query.eq("calendar_source", filters.calendarSource)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        handleSupabaseError(error)
      }

      return data || []
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * IDでスケジュールを取得
   */
  static async getById(id: string): Promise<Schedule | null> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase.from("schedules").select("*").eq("id", id).eq("user_id", user.id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
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
   * 日付範囲でスケジュールを取得
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<Schedule[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_date", startDate)
        .lte("start_date", endDate)
        .order("start_date", { ascending: true })

      if (error) {
        handleSupabaseError(error)
      }

      return data || []
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      }
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
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      // バリデーション
      if (data.title !== undefined && !data.title?.trim()) {
        throw new ValidationError("タイトルは必須です。", "title")
      }

      const { data: schedule, error } = await supabase
        .from("schedules")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }

      return schedule
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error
      }
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
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { error } = await supabase.from("schedules").delete().eq("id", id).eq("user_id", user.id)

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
   * 外部IDでスケジュールを取得
   */
  static async getByExternalId(externalId: string, calendarSource: string): Promise<Schedule | null> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("external_id", externalId)
        .eq("calendar_source", calendarSource)
        .eq("user_id", user.id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
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
   * カレンダーソース別のスケジュール数を取得
   */
  static async getCountBySource(): Promise<Record<string, number>> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase.from("schedules").select("calendar_source").eq("user_id", user.id)

      if (error) {
        handleSupabaseError(error)
      }

      const counts: Record<string, number> = {}
      data?.forEach((schedule) => {
        counts[schedule.calendar_source] = (counts[schedule.calendar_source] || 0) + 1
      })

      return counts
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
      .channel("schedules_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedules",
          filter: `user_id=eq.${userId}`,
        },
        callback,
      )
      .subscribe()
  }
}
