"use client"

import { useState, useEffect, useCallback } from "react"
import { SchedulesService, type ScheduleFilters } from "@/services/schedules.service"
import type { Schedule, ScheduleInsert } from "@/types/database"
import { useAuth } from "./use-auth"

export function useSchedules(filters: ScheduleFilters = {}) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  const fetchSchedules = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSchedules([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await SchedulesService.getAll(filters)
      setSchedules(data)
    } catch (err: any) {
      setError(err.message || "スケジュールの取得に失敗しました。")
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, JSON.stringify(filters)])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  // リアルタイム更新の監視
  useEffect(() => {
    if (!user) return

    const subscription = SchedulesService.subscribeToChanges(user.id, (payload) => {
      console.log("Schedule changed:", payload)
      fetchSchedules() // データを再取得
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchSchedules])

  const addSchedule = async (data: Omit<ScheduleInsert, "user_id">) => {
    try {
      const newSchedule = await SchedulesService.create(data)

      // ローカル状態を更新
      setSchedules((prev) =>
        [...prev, newSchedule].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()),
      )

      return newSchedule
    } catch (err: any) {
      setError(err.message || "スケジュールの追加に失敗しました。")
      throw err
    }
  }

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    try {
      const updatedSchedule = await SchedulesService.update(id, updates)

      // ローカル状態を更新
      setSchedules((prev) =>
        prev
          .map((schedule) => (schedule.id === id ? updatedSchedule : schedule))
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()),
      )

      return updatedSchedule
    } catch (err: any) {
      setError(err.message || "スケジュールの更新に失敗しました。")
      throw err
    }
  }

  const deleteSchedule = async (id: string) => {
    try {
      await SchedulesService.delete(id)

      // ローカル状態を更新
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id))
    } catch (err: any) {
      setError(err.message || "スケジュールの削除に失敗しました。")
      throw err
    }
  }

  const getSchedulesByDateRange = async (startDate: string, endDate: string) => {
    try {
      return await SchedulesService.getByDateRange(startDate, endDate)
    } catch (err: any) {
      setError(err.message || "スケジュールの取得に失敗しました。")
      throw err
    }
  }

  const getCountBySource = async () => {
    try {
      return await SchedulesService.getCountBySource()
    } catch (err: any) {
      setError(err.message || "統計データの取得に失敗しました。")
      throw err
    }
  }

  return {
    schedules,
    loading,
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDateRange,
    getCountBySource,
    refetch: fetchSchedules,
    clearError: () => setError(null),
  }
}
