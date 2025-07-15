import { supabase } from "@/lib/supabase"
import { handleSupabaseError, DatabaseError } from "@/lib/errors"
import type { HealthRecord, HealthRecordInsert, HealthRecordUpdate, HealthStatus } from "@/types/database"

export class HealthRecordsService {
  /**
   * 体調記録を作成
   */
  static async create(data: Omit<HealthRecordInsert, "user_id">): Promise<HealthRecord> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: record, error } = await supabase
        .from("health_records")
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }

      return record
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * 体調記録を取得（ユーザー別）
   */
  static async getAll(): Promise<HealthRecord[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: records, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) {
        handleSupabaseError(error)
      }

      return records || []
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * 特定の日付の体調記録を取得
   */
  static async getByDate(date: string): Promise<HealthRecord | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: record, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
        .single()

      if (error && error.code !== "PGRST116") {
        handleSupabaseError(error)
      }

      return record || null
    } catch (error) {
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
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: record, error } = await supabase
        .from("health_records")
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

      return record
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * 日付で体調記録を更新または作成
   */
  static async upsertByDate(date: string, status: HealthStatus, notes?: string): Promise<HealthRecord> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data: record, error } = await supabase
        .from("health_records")
        .upsert(
          {
            user_id: user.id,
            date,
            status,
            notes,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,date",
          },
        )
        .select()
        .single()

      if (error) {
        handleSupabaseError(error)
      }

      return record
    } catch (error) {
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
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { error } = await supabase.from("health_records").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        handleSupabaseError(error)
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * 期間別の統計を取得
   */
  static async getStatistics(startDate?: string, endDate?: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      let query = supabase.from("health_records").select("*").eq("user_id", user.id)

      if (startDate) {
        query = query.gte("date", startDate)
      }
      if (endDate) {
        query = query.lte("date", endDate)
      }

      const { data: records, error } = await query.order("date", { ascending: false })

      if (error) {
        handleSupabaseError(error)
      }

      const total = records?.length || 0
      const good = records?.filter((r) => r.status === "good").length || 0
      const normal = records?.filter((r) => r.status === "normal").length || 0
      const bad = records?.filter((r) => r.status === "bad").length || 0

      return {
        total,
        good,
        normal,
        bad,
        goodPercentage: total > 0 ? Math.round((good / total) * 100) : 0,
        normalPercentage: total > 0 ? Math.round((normal / total) * 100) : 0,
        badPercentage: total > 0 ? Math.round((bad / total) * 100) : 0,
        records: records || [],
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
      } = await supabase.auth.getUser()

      if (!user) {
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

      const { data: records, error } = await supabase
        .from("health_records")
        .upsert(sampleRecords, { onConflict: "user_id,date" })
        .select()

      if (error) {
        handleSupabaseError(error)
      }

      return records || []
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}
