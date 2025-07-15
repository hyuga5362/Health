export type HealthStatus = "good" | "normal" | "bad"

export interface Database {
  public: {
    Tables: {
      health_records: {
        Row: {
          id: string
          user_id: string
          date: string
          status: HealthStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          status: HealthStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          status?: HealthStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          date: string
          start_time: string | null
          end_time: string | null
          is_all_day: boolean
          calendar_source: string
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          date: string
          start_time?: string | null
          end_time?: string | null
          is_all_day?: boolean
          calendar_source?: string
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          date?: string
          start_time?: string | null
          end_time?: string | null
          is_all_day?: boolean
          calendar_source?: string
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          font_size?: number
          week_starts_monday?: boolean
          google_calendar_connected?: boolean
          apple_calendar_connected?: boolean
          theme?: "light" | "dark" | "system"
          notifications_enabled?: boolean
          reminder_time?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          font_size?: number
          week_starts_monday?: boolean
          google_calendar_connected?: boolean
          apple_calendar_connected?: boolean
          theme?: "light" | "dark" | "system"
          notifications_enabled?: boolean
          reminder_time?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type HealthRecord = Database["public"]["Tables"]["health_records"]["Row"]
export type HealthRecordInsert = Database["public"]["Tables"]["health_records"]["Insert"]
export type HealthRecordUpdate = Database["public"]["Tables"]["health_records"]["Update"]

export type Schedule = Database["public"]["Tables"]["schedules"]["Row"]
export type ScheduleInsert = Database["public"]["Tables"]["schedules"]["Insert"]
export type ScheduleUpdate = Database["public"]["Tables"]["schedules"]["Update"]

export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"]
export type UserSettingsInsert = Database["public"]["Tables"]["user_settings"]["Insert"]
export type UserSettingsUpdate = Database["public"]["Tables"]["user_settings"]["Update"]
