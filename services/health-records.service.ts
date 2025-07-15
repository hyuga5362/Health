import { supabase } from "@/lib/supabase"
import { handleSupabaseError, DatabaseError, ValidationError, validateHealthStatus } from "@/lib/errors"
import type { HealthRecord, HealthRecordInsert, HealthRecordUpdate, HealthStatus } from "@/types/database"

export interface HealthRecordFilters {
  startDate?: string
  endDate?: string
  status?: HealthStatus
  limit?: number
  offset?: number
}

export interface HealthRecordStats {
  total: number
  good: number
  normal: number
  bad: number
  goodPercentage: number
  normalPercentage: number
  badPercentage: number
}

export class HealthRecordsService {
  /**
   * 体調記録を作成
   */
  static async create(data: Omit<HealthRecordInsert, "user_id">): Promise<HealthRecord> {
    try {
      // 現在のユーザーを取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      // バリデーション
      if (!data.date) {
        throw new ValidationError("日付は必須です。", "date")
      }

      if (!data.status || !validateHealthStatus(data.status)) {
        throw new ValidationError("有効な体調ステータスを選択してください。", "status")
      }

      const insertData: HealthRecordInsert = {
        ...data,
        user_id: user.id,
      }

      const { data: record, error } = await supabase.from("health_records").insert(insertData).select().single()

      if (error) {
        handleSupabaseError(error)
      }

      return record
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * 体調記録を取得（フィルター付き）
   */
  static async getAll(filters: HealthRecordFilters = {}): Promise<HealthRecord[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      let query = supabase.from("health_records").select("*").eq("user_id", user.id).order("date", { ascending: false })

      // フィルターを適用
      if (filters.startDate) {
        query = query.gte("date", filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte("date", filters.endDate)
      }

      if (filters.status) {
        query = query.eq("status", filters.status)
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
   * IDで体調記録を取得
   */
  static async getById(id: string): Promise<HealthRecord | null> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("id", id)
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
   * 日付で体調記録を取得
   */
  static async getByDate(date: string): Promise<HealthRecord | null> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("date", date)
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
   * 体調記録を更新
   */
  static async update(id: string, data: HealthRecordUpdate): Promise<HealthRecord> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      // バリデーション
      if (data.status && !validateHealthStatus(data.status)) {
        throw new ValidationError("有効な体調ステータスを選択してください。", "status")
      }

      const { data: record, error } = await supabase
        .from("health_records")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }

      return record
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * 日付で体調記録をアップサート（存在すれば更新、なければ作成）
   */
  static async upsertByDate(date: string, status: HealthStatus, notes?: string): Promise<HealthRecord> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      // バリデーション
      if (!validateHealthStatus(status)) {
        throw new ValidationError("有効な体調ステータスを選択してください。", "status")
      }

      const upsertData: HealthRecordInsert = {
        user_id: user.id,
        date,
        status,
        notes,
      }

      const { data: record, error } = await supabase
        .from("health_records")
        .upsert(upsertData, {
          onConflict: "user_id,date",
          ignoreDuplicates: false,
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }

      return record
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * 体調記録を削除
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

      const { error } = await supabase.from("health_records").delete().eq("id", id).eq("user_id", user.id)

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
   * 統計データを取得
   */
  static async getStats(filters: HealthRecordFilters = {}): Promise<HealthRecordStats> {
    try {
      const records = await this.getAll(filters)

      const total = records.length
      const good = records.filter((r) => r.status === "good").length
      const normal = records.filter((r) => r.status === "normal").length
      const bad = records.filter((r) => r.status === "bad").length

      return {
        total,
        good,
        normal,
        bad,
        goodPercentage: total > 0 ? Math.round((good / total) * 100) : 0,
        normalPercentage: total > 0 ? Math.round((normal / total) * 100) : 0,
        badPercentage: total > 0 ? Math.round((bad / total) * 100) : 0,
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * サンプルデータを生成
   */
  static async generateSampleData(days = 30): Promise<HealthRecord[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new DatabaseError("認証が必要です。")
      }

      const today = new Date()
      const sampleRecords: HealthRecordInsert[] = []

      for (let i = 0; i < days; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)

        // ランダムに体調を決定（良い日が多めになるように）
        const random = Math.random()
        let status: HealthStatus
        if (random < 0.5) status = "good"
        else if (random < 0.8) status = "normal"
        else status = "bad"

        // ランダムなメモを追加（20%の確率）
        const notes =
          Math.random() < 0.2
            ? ["よく眠れた", "運動した", "疲れ気味", "ストレス多め", "体調良好"][Math.floor(Math.random() * 5)]
            : undefined

        sampleRecords.push({
          user_id: user.id,
          date: date.toISOString().split("T")[0],
          status,
          notes,
        })
      }

      const { data, error } = await supabase
        .from("health_records")
        .upsert(sampleRecords, { onConflict: "user_id,date" })
        .select()

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
   * リアルタイム変更を監視
   */
  static subscribeToChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel("health_records_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "health_records",
          filter: `user_id=eq.${userId}`,
        },
        callback,
      )
      .subscribe()
  }
}
