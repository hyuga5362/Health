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
    return getItem(STORAGE_KEYS.HEALTH_RECORDS) || []
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

    setItem(STORAGE_KEYS.HEALTH_RECORDS, records)
    return records.find((r) => r.date === record.date)!
  },

  deleteHealthRecord: (id: string): void => {
    const records = localStorageAPI.getHealthRecords()
    const filtered = records.filter((r) => r.id !== id)
    setItem(STORAGE_KEYS.HEALTH_RECORDS, filtered)
  },

  // スケジュール
  getSchedules: (): Schedule[] => {
    if (typeof window === "undefined") return []
    return getItem(STORAGE_KEYS.SCHEDULES) || []
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
    setItem(STORAGE_KEYS.SCHEDULES, schedules)
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

    return (
      getItem(STORAGE_KEYS.USER_SETTINGS) || {
        id: "default",
        font_size: 16,
        week_starts_monday: false,
        google_calendar_connected: false,
        apple_calendar_connected: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    )
  },

  saveUserSettings: (settings: Partial<UserSettings>): UserSettings => {
    const current = localStorageAPI.getUserSettings()
    const updated = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    }
    setItem(STORAGE_KEYS.USER_SETTINGS, updated)
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

  setItem(STORAGE_KEYS.HEALTH_RECORDS, sampleRecords)
  return sampleRecords
}

// ローカルストレージ操作関数
export const setItem = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Error setting item to local storage", error)
  }
}

export const getItem = (key: string) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error("Error getting item from local storage", error)
    return null
  }
}

export const removeItem = (key: string) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Error removing item from local storage", error)
  }
}
