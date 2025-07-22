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
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Creating health record for user:", user.id, "data:", data)

      const insertData: HealthRecordInsert = {
        ...data,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: record, error } = await supabase.from("health_records").insert(insertData).select().single()

      if (error) {
        console.error("Database insert error:", error)
        handleSupabaseError(error)
      }

      console.log("Health record created successfully:", record)
      return record
    } catch (error) {
      console.error("HealthRecordsService.create error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
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
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Fetching health records for user:", user.id)

      const { data: records, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) {
        console.error("Database select error:", error)
        handleSupabaseError(error)
      }

      console.log("Health records fetched successfully:", records?.length || 0, "records")
      return records || []
    } catch (error) {
      console.error("HealthRecordsService.getAll error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
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
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Fetching health record for user:", user.id, "date:", date)

      const { data: record, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
        .maybeSingle()

      if (error) {
        console.error("Database select error:", error)
        handleSupabaseError(error)
      }

      console.log("Health record fetched:", record ? "found" : "not found")
      return record || null
    } catch (error) {
      console.error("HealthRecordsService.getByDate error:", error)
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

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Updating health record:", id, "for user:", user.id, "data:", data)

      const updateData: HealthRecordUpdate = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      const { data: record, error } = await supabase
        .from("health_records")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Database update error:", error)
        handleSupabaseError(error)
      }

      console.log("Health record updated successfully:", record)
      return record
    } catch (error) {
      console.error("HealthRecordsService.update error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
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
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Upserting health record for user:", user.id, "date:", date, "status:", status)

      const upsertData: HealthRecordInsert = {
        user_id: user.id,
        date,
        status,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
        console.error("Database upsert error:", error)
        handleSupabaseError(error)
      }

      console.log("Health record upserted successfully:", record)
      return record
    } catch (error) {
      console.error("HealthRecordsService.upsertByDate error:", error)
      if (error instanceof DatabaseError) {
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

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Deleting health record:", id, "for user:", user.id)

      const { error } = await supabase.from("health_records").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        console.error("Database delete error:", error)
        handleSupabaseError(error)
      }

      console.log("Health record deleted successfully")
    } catch (error) {
      console.error("HealthRecordsService.delete error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
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
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Fetching statistics for user:", user.id, "period:", startDate, "to", endDate)

      let query = supabase.from("health_records").select("*").eq("user_id", user.id)

      if (startDate) {
        query = query.gte("date", startDate)
      }
      if (endDate) {
        query = query.lte("date", endDate)
      }

      const { data: records, error } = await query.order("date", { ascending: false })

      if (error) {
        console.error("Database select error:", error)
        handleSupabaseError(error)
      }

      const total = records?.length || 0
      const good = records?.filter((r) => r.status === "good").length || 0
      const normal = records?.filter((r) => r.status === "normal").length || 0
      const bad = records?.filter((r) => r.status === "bad").length || 0

      const stats = {
        total,
        good,
        normal,
        bad,
        goodPercentage: total > 0 ? Math.round((good / total) * 100) : 0,
        normalPercentage: total > 0 ? Math.round((normal / total) * 100) : 0,
        badPercentage: total > 0 ? Math.round((bad / total) * 100) : 0,
        records: records || [],
      }

      console.log("Statistics calculated:", stats)
      return stats
    } catch (error) {
      console.error("HealthRecordsService.getStatistics error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
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

      if (userError) {
        console.error("User authentication error:", userError)
        throw new DatabaseError("認証エラーが発生しました。再度ログインしてください。")
      }

      if (!user) {
        throw new DatabaseError("認証が必要です。ログインしてください。")
      }

      console.log("Generating sample data for user:", user.id, "days:", days)

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
            : null

        sampleRecords.push({
          user_id: user.id,
          date: date.toISOString().split("T")[0],
          status,
          notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      const { data: records, error } = await supabase
        .from("health_records")
        .upsert(sampleRecords, { onConflict: "user_id,date", ignoreDuplicates: false })
        .select()

      if (error) {
        console.error("Database upsert error:", error)
        handleSupabaseError(error)
      }

      console.log("Sample data generated successfully:", records?.length || 0, "records")
      return records || []
    } catch (error) {
      console.error("HealthRecordsService.generateSampleData error:", error)
      if (error instanceof DatabaseError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }
}
