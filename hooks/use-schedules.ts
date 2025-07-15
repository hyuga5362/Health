"use client"

import { useState, useEffect, useCallback } from "react"
import { SchedulesService } from "@/services/schedules.service"
import { DatabaseError } from "@/lib/errors"
import { useAuth } from "./use-auth"
import type { Schedule, ScheduleInsert, ScheduleUpdate } from "@/types/database"

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

  // 全てのスケジュールを取得
  const fetchSchedules = useCallback(async () => {
    if (!isAuthenticated) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const schedules = await SchedulesService.getAll()
      setState((prev) => ({ ...prev, schedules, loading: false }))
    } catch (err) {
      const errorMessage = err instanceof DatabaseError ? err.message : "スケジュールの取得に失敗しました"
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
    }
  }, [isAuthenticated])

  // スケジュールを作成
  const createSchedule = useCallback(async (data: Omit<ScheduleInsert, "user_id">) => {
    try {
      setState((prev) => ({ ...prev, error: null }))
      const newSchedule = await SchedulesService.create(data)
      setState((prev) => ({
        ...prev,
        schedules: [...prev.schedules, newSchedule].sort(
          (a, b) => new Date(a.date || "").getTime() - new Date(b.date || "").getTime(),
        ),
      }))
      return newSchedule
    } catch (err) {
      const errorMessage = err instanceof DatabaseError ? err.message : "スケジュールの作成に失敗しました"
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw err
    }
  }, [])

  // スケジュールを更新
  const updateSchedule = useCallback(async (id: string, data: ScheduleUpdate) => {
    try {
      setState((prev) => ({ ...prev, error: null }))
      const updatedSchedule = await SchedulesService.update(id, data)
      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.map((s) => (s.id === id ? updatedSchedule : s)),
      }))
      return updatedSchedule
    } catch (err) {
      const errorMessage = err instanceof DatabaseError ? err.message : "スケジュールの更新に失敗しました"
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw err
    }
  }, [])

  // スケジュールを削除
  const deleteSchedule = useCallback(async (id: string) => {
    try {
      setState((prev) => ({ ...prev, error: null }))
      await SchedulesService.delete(id)
      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.filter((s) => s.id !== id),
      }))
    } catch (err) {
      const errorMessage = err instanceof DatabaseError ? err.message : "スケジュールの削除に失敗しました"
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw err
    }
  }, [])

  // 特定の日付のスケジュールを取得
  const getSchedulesByDate = useCallback(
    (date: string): Schedule[] => {
      return state.schedules.filter((s) => s.date === date)
    },
    [state.schedules],
  )

  // エラーをクリア
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // 認証状態が変わったらデータを取得
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
  }, [isAuthenticated, user?.id, fetchSchedules])

  return {
    schedules: state.schedules,
    loading: state.loading,
    error: state.error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDate,
    clearError,
  }
}
