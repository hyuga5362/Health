export type HealthStatus = "good" | "normal" | "bad"
export type Theme = "light" | "dark" | "system"

export interface HealthRecord {
  id: string
  user_id: string
  date: string
  status: HealthStatus
  score: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface HealthRecordInsert {
  id?: string
  user_id: string
  date: string
  status: HealthStatus
  score?: number | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface HealthRecordUpdate {
  id?: string
  user_id?: string
  date?: string
  status?: HealthStatus
  score?: number | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface UserSettings {
  id: string
  user_id: string
  font_size: number
  week_starts_monday: boolean
  // google_calendar_connected: boolean // 削除
  // apple_calendar_connected: boolean // 削除
  theme: Theme
  notifications_enabled: boolean
  reminder_time: string
  created_at: string
  updated_at: string
}

export interface UserSettingsInsert {
  id?: string
  user_id: string
  font_size?: number
  week_starts_monday?: boolean
  // google_calendar_connected?: boolean // 削除
  // apple_calendar_connected?: boolean // 削除
  theme?: Theme
  notifications_enabled?: boolean
  reminder_time?: string
  created_at?: string
  updated_at?: string
}

export interface UserSettingsUpdate extends Partial<UserSettingsInsert> {}

export interface Schedule {
  id: string
  user_id: string
  title: string
  description: string | null
  calendar_source: string | null
  start_date: string | null
  end_date: string | null
  date: string | null
  start_time: string | null
  end_time: string | null
  is_all_day: boolean
  reminder_enabled: boolean
  created_at: string
  updated_at: string
}

export interface ScheduleInsert {
  id?: string
  user_id: string
  title: string
  description?: string | null
  calendar_source?: string | null
  start_date?: string | null
  end_date?: string | null
  date?: string | null
  start_time?: string | null
  end_time?: string | null
  is_all_day?: boolean
  reminder_enabled?: boolean
  created_at?: string
  updated_at?: string
}

export interface ScheduleUpdate extends Partial<ScheduleInsert> {}

export type Database = {
  public: {
    Tables: {
      health_records: {
        Row: HealthRecord
        Insert: HealthRecord
        Update: HealthRecord
      }
      user_settings: {
        Row: UserSettings
        Insert: UserSettings
        Update: UserSettings
      }
      schedules: {
        Row: Schedule
        Insert: Schedule
        Update: Schedule
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
