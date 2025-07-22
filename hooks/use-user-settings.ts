"use client"

import { useState, useEffect, useCallback } from "react"
import { UserSettingsService } from "@/services/user-settings.service"
import { getErrorMessage, logError } from "@/lib/errors"
import { useAuth } from "./use-auth"
import type { UserSetting, UserSettingUpdate } from "@/types/database"

interface UserSettingsState {
  userSettings: UserSetting | null
  loading: boolean
  error: string | null
}

export function useUserSettings() {
  const { isAuthenticated, user } = useAuth()
  const [state, setState] = useState<UserSettingsState>({
    userSettings: null,
    loading: false,
    error: null,
  })

  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated) return

    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const settings = await UserSettingsService.get()
      setState((prev) => ({
        ...prev,
        userSettings: settings,
        loading: false,
      }))
    } catch (error) {
      logError(error, "useUserSettings.fetchSettings")
      setState((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error),
      }))
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings()
    } else {
      setState({ userSettings: null, loading: false, error: null })
    }
  }, [isAuthenticated, user?.id, fetchSettings])

  const updateSetting = async (data: UserSettingUpdate) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const updatedSettings = await UserSettingsService.update(data)
      setState((prev) => ({
        ...prev,
        userSettings: updatedSettings,
        loading: false,
      }))
      return updatedSettings
    } catch (error) {
      logError(error, "useUserSettings.updateSetting")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }))
  }

  return {
    userSettings: state.userSettings,
    loading: state.loading,
    error: state.error,
    updateSetting,
    refetch: fetchSettings,
    clearError,
  }
}
