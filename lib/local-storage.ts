export type HealthStatus = "good" | "normal" | "bad"

export interface HealthRecord {
  id: string
  date: string
  status: HealthStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  is_all_day: boolean
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  font_size: number
  week_starts_monday: boolean
  google_calendar_connected: boolean
  apple_calendar_connected: boolean
  created_at: string
  updated_at: string
}

// ローカルストレージのキー
const STORAGE_KEYS = {
  HEALTH_RECORDS: "health_records",
  SCHEDULES: "schedules",
  USER_SETTINGS: "user_settings",
}

// ローカルストレージ操作関数
export const localStorageAPI = {
  // 体調記録
  getHealthRecords: (): HealthRecord[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.HEALTH_RECORDS)
    return data ? JSON.parse(data) : []
  },

  saveHealthRecord: (record: Omit<HealthRecord, "id" | "created_at" | "updated_at">): HealthRecord => {
    const records = localStorageAPI.getHealthRecords()
    const now = new Date().toISOString()

    // 同じ日付の記録があれば更新、なければ新規作成
    const existingIndex = records.findIndex((r) => r.date === record.date)

    if (existingIndex >= 0) {
      records[existingIndex] = {
        ...records[existingIndex],
        ...record,
        updated_at: now,
      }
    } else {
      const newRecord: HealthRecord = {
        id: crypto.randomUUID(),
        ...record,
        created_at: now,
        updated_at: now,
      }
      records.push(newRecord)
    }

    localStorage.setItem(STORAGE_KEYS.HEALTH_RECORDS, JSON.stringify(records))
    return records.find((r) => r.date === record.date)!
  },

  deleteHealthRecord: (id: string): void => {
    const records = localStorageAPI.getHealthRecords()
    const filtered = records.filter((r) => r.id !== id)
    localStorage.setItem(STORAGE_KEYS.HEALTH_RECORDS, JSON.stringify(filtered))
  },

  // スケジュール
  getSchedules: (): Schedule[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES)
    return data ? JSON.parse(data) : []
  },

  saveSchedule: (schedule: Omit<Schedule, "id" | "created_at" | "updated_at">): Schedule => {
    const schedules = localStorageAPI.getSchedules()
    const now = new Date().toISOString()

    const newSchedule: Schedule = {
      id: crypto.randomUUID(),
      ...schedule,
      created_at: now,
      updated_at: now,
    }

    schedules.push(newSchedule)
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules))
    return newSchedule
  },

  // ユーザー設定
  getUserSettings: (): UserSettings => {
    if (typeof window === "undefined") {
      return {
        id: "default",
        font_size: 16,
        week_starts_monday: false,
        google_calendar_connected: false,
        apple_calendar_connected: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)
    return data
      ? JSON.parse(data)
      : {
          id: "default",
          font_size: 16,
          week_starts_monday: false,
          google_calendar_connected: false,
          apple_calendar_connected: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
  },

  saveUserSettings: (settings: Partial<UserSettings>): UserSettings => {
    const current = localStorageAPI.getUserSettings()
    const updated = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updated))
    return updated
  },
}

// 初期データの生成（デモ用）
export const generateSampleData = () => {
  const today = new Date()
  const sampleRecords: HealthRecord[] = []

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
      id: crypto.randomUUID(),
      date: date.toISOString().split("T")[0],
      status,
      created_at: date.toISOString(),
      updated_at: date.toISOString(),
    })
  }

  localStorage.setItem(STORAGE_KEYS.HEALTH_RECORDS, JSON.stringify(sampleRecords))
  return sampleRecords
}
