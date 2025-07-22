"use client"

import { useState, useEffect, useCallback } from "react"
import { SchedulesService } from "@/services/schedules.service"
import type { Schedule, ScheduleInsert, ScheduleUpdate } from "@/types/database"

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // スケジュール一覧を取得
  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await SchedulesService.getAll()
      setSchedules(data)
    } catch (err) {
      console.error("Failed to fetch schedules:", err)
      setError(err instanceof Error ? err.message : "スケジュールの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }, [])

  // 特定の日付のスケジュールを取得
  const getSchedulesByDate = useCallback(async (date: string) => {
    try {
      setError(null)
      const data = await SchedulesService.getByDate(date)
      return data
    } catch (err) {
      console.error("Failed to fetch schedules by date:", err)
      setError(err instanceof Error ? err.message : "スケジュールの取得に失敗しました")
      return []
    }
  }, [])

  // 期間内のスケジュールを取得
  const getSchedulesByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setError(null)
      const data = await SchedulesService.getByDateRange(startDate, endDate)
      return data
    } catch (err) {
      console.error("Failed to fetch schedules by date range:", err)
      setError(err instanceof Error ? err.message : "スケジュールの取得に失敗しました")
      return []
    }
  }, [])

  // スケジュールを作成
  const createSchedule = useCallback(async (data: Omit<ScheduleInsert, "user_id">) => {
    try {
      setError(null)
      const newSchedule = await SchedulesService.create(data)
      setSchedules((prev) => [...prev, newSchedule])
      return newSchedule
    } catch (err) {
      console.error("Failed to create schedule:", err)
      setError(err instanceof Error ? err.message : "スケジュールの作成に失敗しました")
      throw err
    }
  }, [])

  // スケジュールを更新
  const updateSchedule = useCallback(async (id: string, data: ScheduleUpdate) => {
    try {
      setError(null)
      const updatedSchedule = await SchedulesService.update(id, data)
      setSchedules((prev) => prev.map((schedule) => (schedule.id === id ? updatedSchedule : schedule)))
      return updatedSchedule
    } catch (err) {
      console.error("Failed to update schedule:", err)
      setError(err instanceof Error ? err.message : "スケジュールの更新に失敗しました")
      throw err
    }
  }, [])

  // スケジュールを削除
  const deleteSchedule = useCallback(async (id: string) => {
    try {
      setError(null)
      await SchedulesService.delete(id)
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id))
    } catch (err) {
      console.error("Failed to delete schedule:", err)
      setError(err instanceof Error ? err.message : "スケジュールの削除に失敗しました")
      throw err
    }
  }, [])

  // 繰り返しスケジュールを作成
  const createRecurringSchedule = useCallback(
    async (data: Omit<ScheduleInsert, "user_id">, endDate: string, frequency: "daily" | "weekly" | "monthly") => {
      try {
        setError(null)
        const newSchedules = await SchedulesService.createRecurring(data, endDate, frequency)
        setSchedules((prev) => [...prev, ...newSchedules])
        return newSchedules
      } catch (err) {
        console.error("Failed to create recurring schedule:", err)
        setError(err instanceof Error ? err.message : "繰り返しスケジュールの作成に失敗しました")
        throw err
      }
    },
    [],
  )

  // 初回データ取得
  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    getSchedulesByDate,
    getSchedulesByDateRange,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    createRecurringSchedule,
  }
}
