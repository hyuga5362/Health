import { supabase } from "@/lib/supabase"
import { handleSupabaseError, DatabaseError } from "@/lib/errors"
import type { HealthRecord, HealthStatus } from "@/types/database"

export class HealthRecordsService {
  /**
   * 全ての体調記録を取得
   */
  static async getAll(): Promise<HealthRecord[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) {
        handleSupabaseError(error)
      }
      return data || []
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * 特定の日の体調記録を取得
   */
  static async getByDate(date: string): Promise<HealthRecord | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
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
   * 体調記録を追加または更新
   */
  static async upsert(date: string, status: HealthStatus, notes?: string): Promise<HealthRecord> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const recordData = {
        user_id: user.id,
        date: date,
        status: status,
        notes: notes || null,
      }

      const { data, error } = await supabase
        .from("health_records")
        .upsert(recordData, { onConflict: "user_id,date" })
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
   * サンプルデータを生成
   */
  static async generateSampleData(days: number): Promise<HealthRecord[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new DatabaseError("認証が必要です。")
      }

      const today = new Date()
      const sampleRecords = []

      for (let i = 0; i < days; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)

        const random = Math.random()
        let status: HealthStatus
        if (random < 0.5) status = "good"
        else if (random < 0.8) status = "normal"
        else status = "bad"

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
      handleSupabaseError(error)
    }
  }
}
