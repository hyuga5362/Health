import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type HealthStatus = "good" | "normal" | "bad"

export interface HealthRecord {
  id: string
  user_id: string
  date: string
  status: HealthStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  user_id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  is_all_day: boolean
  calendar_source: string
  external_id?: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  font_size: number
  week_starts_monday: boolean
  google_calendar_connected: boolean
  apple_calendar_connected: boolean
  theme: "light" | "dark" | "system"
  notifications_enabled: boolean
  reminder_time: string
  created_at: string
  updated_at: string
}

// 認証関数
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
  return data
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// データ連携関数
export const syncHealthData = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  // 体調記録の同期
  const { data: healthRecords, error: healthError } = await supabase
    .from("health_records")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (healthError) throw healthError

  // ユーザー設定の同期
  const { data: userSettings, error: settingsError } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (settingsError && settingsError.code !== "PGRST116") throw settingsError

  return {
    healthRecords: healthRecords || [],
    userSettings: userSettings || null,
  }
}

export const exportHealthData = async (format: "json" | "csv" = "json") => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data: healthRecords, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (error) throw error

  if (format === "csv") {
    // CSV形式でエクスポート
    const headers = ["日付", "体調", "メモ", "作成日時", "更新日時"]
    const csvData = healthRecords.map((record) => [
      record.date,
      record.status === "good" ? "良い" : record.status === "normal" ? "普通" : "悪い",
      record.notes || "",
      record.created_at,
      record.updated_at,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    return csvContent
  }

  // JSON形式でエクスポート
  return JSON.stringify(healthRecords, null, 2)
}

export const importHealthData = async (data: HealthRecord[]) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  // データの検証とユーザーIDの設定
  const validatedData = data.map((record) => ({
    ...record,
    user_id: user.id,
    created_at: record.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const { data: result, error } = await supabase
    .from("health_records")
    .upsert(validatedData, { onConflict: "user_id,date" })
    .select()

  if (error) throw error
  return result
}

// サンプルデータ生成関数（Supabase版）
export const generateSampleDataToSupabase = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const today = new Date()
  const sampleRecords = []

  // 過去30日分のサンプルデータを生成
  for (let i = 0; i < 30; i++) {
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

  const { data, error } = await supabase.from("health_records").upsert(sampleRecords, { onConflict: "user_id,date" })

  if (error) throw error
  return data
}

// ユーザー設定の初期化
export const initializeUserSettings = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data: existingSettings } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

  if (!existingSettings) {
    const { data, error } = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        font_size: 16,
        week_starts_monday: false,
        google_calendar_connected: false,
        apple_calendar_connected: false,
        theme: "light",
        notifications_enabled: true,
        reminder_time: "09:00:00",
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  return existingSettings
}

// リアルタイム同期の設定
export const subscribeToHealthRecords = (userId: string, callback: (payload: any) => void) => {
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

// 統計データの取得
export const getHealthStatistics = async (startDate?: string, endDate?: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  let query = supabase.from("health_records").select("*").eq("user_id", user.id)

  if (startDate) {
    query = query.gte("date", startDate)
  }
  if (endDate) {
    query = query.lte("date", endDate)
  }

  const { data, error } = await query.order("date", { ascending: false })

  if (error) throw error

  const records = data || []
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
    records,
  }
}
