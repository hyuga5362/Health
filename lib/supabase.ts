import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Auth functions
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

// Health Records functions
export type HealthRecord = Database["public"]["Tables"]["health_records"]["Row"]
export type HealthRecordInsert = Database["public"]["Tables"]["health_records"]["Insert"]
export type HealthRecordUpdate = Database["public"]["Tables"]["health_records"]["Update"]
export type HealthStatus = Database["public"]["Enums"]["health_status"]

export async function getHealthRecords(userId: string): Promise<HealthRecord[]> {
  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function addHealthRecord(record: HealthRecordInsert): Promise<HealthRecord> {
  const { data, error } = await supabase.from("health_records").insert(record).select().single()

  if (error) {
    throw error
  }

  return data
}

export async function updateHealthRecord(id: string, updates: HealthRecordUpdate): Promise<HealthRecord> {
  const { data, error } = await supabase.from("health_records").update(updates).eq("id", id).select().single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteHealthRecord(id: string): Promise<void> {
  const { error } = await supabase.from("health_records").delete().eq("id", id)

  if (error) {
    throw error
  }
}

// User Settings functions
export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"]
export type UserSettingsInsert = Database["public"]["Tables"]["user_settings"]["Insert"]
export type UserSettingsUpdate = Database["public"]["Tables"]["user_settings"]["Update"]

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    throw error
  }

  return data
}

export async function createUserSettings(settings: UserSettingsInsert): Promise<UserSettings> {
  const { data, error } = await supabase.from("user_settings").insert(settings).select().single()

  if (error) {
    throw error
  }

  return data
}

export async function updateUserSettings(id: string, updates: UserSettingsUpdate): Promise<UserSettings> {
  const { data, error } = await supabase.from("user_settings").update(updates).eq("id", id).select().single()

  if (error) {
    throw error
  }

  return data
}

// Schedules functions
export type Schedule = Database["public"]["Tables"]["schedules"]["Row"]
export type ScheduleInsert = Database["public"]["Tables"]["schedules"]["Insert"]
export type ScheduleUpdate = Database["public"]["Tables"]["schedules"]["Update"]

export async function getSchedules(userId: string): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export async function addSchedule(schedule: ScheduleInsert): Promise<Schedule> {
  const { data, error } = await supabase.from("schedules").insert(schedule).select().single()

  if (error) {
    throw error
  }

  return data
}

export async function updateSchedule(id: string, updates: ScheduleUpdate): Promise<Schedule> {
  const { data, error } = await supabase.from("schedules").update(updates).eq("id", id).select().single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteSchedule(id: string): Promise<void> {
  const { error } = await supabase.from("schedules").delete().eq("id", id)

  if (error) {
    throw error
  }
}

// Sample data generation
export async function generateSampleHealthRecords(userId: string, days = 30): Promise<HealthRecord[]> {
  const records: HealthRecordInsert[] = []
  const statuses: HealthStatus[] = ["good", "normal", "bad"]

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Generate random status with weighted probability (more good days)
    const rand = Math.random()
    let status: HealthStatus
    if (rand < 0.6) {
      status = "good"
    } else if (rand < 0.85) {
      status = "normal"
    } else {
      status = "bad"
    }

    records.push({
      user_id: userId,
      date: date.toISOString().split("T")[0],
      status,
      score:
        status === "good"
          ? Math.floor(Math.random() * 3) + 8
          : status === "normal"
            ? Math.floor(Math.random() * 3) + 5
            : Math.floor(Math.random() * 3) + 2,
      notes: Math.random() > 0.7 ? `Sample note for ${date.toDateString()}` : null,
    })
  }

  const { data, error } = await supabase.from("health_records").insert(records).select()

  if (error) {
    throw error
  }

  return data || []
}
