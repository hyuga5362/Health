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

    sampleRecords.push({
      user_id: user.id,
      date: date.toISOString().split("T")[0],
      status,
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
