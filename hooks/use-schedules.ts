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
    if (!isAuthenticated) {
      setState({ schedules: [], loading: false, error: null })
      return
    }

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
  }, [isAuthenticated])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules, user?.id])

  const addSchedule = async (schedule: ScheduleInsert) => {
    try {
      const newSchedule = await SchedulesService.create(schedule)
      setState((prev) => ({
        ...prev,
        schedules: [newSchedule, ...prev.schedules].sort(
          (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
        ),
        error: null,
      }))
      return newSchedule
    } catch (error) {
      logError(error, "useSchedules.addSchedule")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  const updateSchedule = async (id: string, updates: ScheduleUpdate) => {
    try {
      const updatedSchedule = await SchedulesService.update(id, updates)
      setState((prev) => ({
        ...prev,
        schedules: prev.schedules.map((s) => (s.id === id ? updatedSchedule : s)),
        error: null,
      }))
      return updatedSchedule
    } catch (error) {
      logError(error, "useSchedules.updateSchedule")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

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
    refetch: fetchSchedules,
    clearError,
  }
}
