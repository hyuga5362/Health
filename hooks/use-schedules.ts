"use client"

import { useState, useEffect } from "react"
import { SchedulesService } from "@/services/schedules.service"
import { getErrorMessage, logError } from "@/lib/errors"
import { useAuth } from "./use-auth"
import type { Schedule, ScheduleInsert } from "@/types/database"

interface SchedulesState {
  schedules: Schedule[]
  loading: boolean
  error: string | null
}

export function useSchedules() {
  const { isAuthenticated, user } = useAuth()
  const [state, setState] = useState<SchedulesState>({
    schedules: [],
    loading: false,
    error: null,
  })

  // スケジュールを取得
  const fetchSchedules = async () => {
    if (!isAuthenticated) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const schedules = await SchedulesService.getAll()
      setState({
        schedules,
        loading: false,
        error: null,
      })
    } catch (error) {
      logError(error, "useSchedules.fetchSchedules")
      setState((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error),
      }))
    }
  }

  // 認証状態が変わったらスケジュールを取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchSchedules()
    } else {
      setState({
        schedules: [],
        loading: false,
        error: null,
      })
    }
  }, [isAuthenticated, user?.id])

  // スケジュールを追加
  const addSchedule = async (data: Omit<ScheduleInsert, "user_id">) => {
    try {
      const schedule = await SchedulesService.create(data)

      setState((prev) => ({
        ...prev,
        schedules: [...prev.schedules, schedule].sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date)
          if (dateCompare !== 0) return dateCompare
          return (a.start_time || "").localeCompare(b.start_time || "")
        }),
        error: null,
      }))

      return schedule
    } catch (error) {
      logError(error, "useSchedules.addSchedule")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // スケジュールを更新
  const updateSchedule = async (id: string, data: Partial<ScheduleInsert>) => {
    try {
      const schedule = await SchedulesService.update(id, data)

      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.map((s) => (s.id === id ? schedule : s)),
        error: null,
      }))

      return schedule
    } catch (error) {
      logError(error, "useSchedules.updateSchedule")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // スケジュールを削除
  const deleteSchedule = async (id: string) => {
    try {
      await SchedulesService.delete(id)

      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.filter((s) => s.id !== id),
        error: null,
      }))
    } catch (error) {
      logError(error, "useSchedules.deleteSchedule")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // 特定の日付のスケジュールを取得
  const getSchedulesByDate = (date: string): Schedule[] => {
    return state.schedules.filter((schedule) => schedule.date === date)
  }

  // 期間別のスケジュールを取得
  const getSchedulesByDateRange = async (startDate: string, endDate: string) => {
    try {
      const schedules = await SchedulesService.getByDateRange(startDate, endDate)
      return schedules
    } catch (error) {
      logError(error, "useSchedules.getSchedulesByDateRange")
      throw error
    }
  }

  // 外部カレンダーから同期
  const syncFromExternalCalendar = async (source: string, schedules: Omit<ScheduleInsert, "user_id">[]) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      await SchedulesService.syncFromExternalCalendar(source, schedules)
      await fetchSchedules() // データを再取得
    } catch (error) {
      logError(error, "useSchedules.syncFromExternalCalendar")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // エラーをクリア
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }))
  }

  return {
    schedules: state.schedules,
    loading: state.loading,
    error: state.error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDate,
    getSchedulesByDateRange,
    syncFromExternalCalendar,
    refetch: fetchSchedules,
    clearError,
  }
}
