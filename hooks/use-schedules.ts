"use client"

import { useState, useEffect, useCallback } from "react"
import { SchedulesService } from "@/services/schedules.service"
import { getErrorMessage, logError } from "@/lib/errors"
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

  const fetchSchedules = useCallback(async () => {
    if (!isAuthenticated) return

    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const fetchedSchedules = await SchedulesService.getAll()
      setState((prev) => ({
        ...prev,
        schedules: fetchedSchedules,
        loading: false,
      }))
    } catch (error) {
      logError(error, "useSchedules.fetchSchedules")
      setState((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error),
      }))
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSchedules()
    } else {
      setState({ schedules: [], loading: false, error: null })
    }
  }, [isAuthenticated, user?.id, fetchSchedules])

  const addSchedule = async (data: Omit<ScheduleInsert, "user_id">) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const newSchedule = await SchedulesService.create(data)
      setState((prev) => ({
        ...prev,
        schedules: [...prev.schedules, newSchedule],
        loading: false,
      }))
      return newSchedule
    } catch (error) {
      logError(error, "useSchedules.addSchedule")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }

  const updateSchedule = async (id: string, data: ScheduleUpdate) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const updatedSchedule = await SchedulesService.update(id, data)
      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.map((s) => (s.id === id ? updatedSchedule : s)),
        loading: false,
      }))
      return updatedSchedule
    } catch (error) {
      logError(error, "useSchedules.updateSchedule")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }

  const deleteSchedule = async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await SchedulesService.delete(id)
      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.filter((s) => s.id !== id),
        loading: false,
      }))
    } catch (error) {
      logError(error, "useSchedules.deleteSchedule")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }

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
    refetchSchedules: fetchSchedules,
    clearError,
  }
}
