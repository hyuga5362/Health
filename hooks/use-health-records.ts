"use client"

import { useState, useEffect } from "react"
import { HealthRecordsService } from "@/services/health-records.service"
import { getErrorMessage, logError } from "@/lib/errors"
import { useAuth } from "./use-auth"
import type { HealthRecord, HealthStatus } from "@/types/database"

interface HealthRecordsState {
  records: HealthRecord[]
  stats: {
    total: number
    good: number
    normal: number
    bad: number
    goodPercentage: number
    normalPercentage: number
    badPercentage: number
  } | null
  loading: boolean
  error: string | null
}

export function useHealthRecords() {
  const { isAuthenticated, user } = useAuth()
  const [state, setState] = useState<HealthRecordsState>({
    records: [],
    stats: null,
    loading: false,
    error: null,
  })

  // データを取得
  const fetchRecords = async () => {
    if (!isAuthenticated) return

    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const records = await HealthRecordsService.getAll()
      const stats = await HealthRecordsService.getStatistics() // 統計もここで取得

      setState({
        records,
        stats,
        loading: false,
        error: null,
      })
    } catch (error) {
      logError(error, "useHealthRecords.fetchRecords")
      setState((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error),
      }))
    }
  }

  // 認証状態が変わったらデータを取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords()
    } else {
      setState({
        records: [],
        stats: null,
        loading: false,
        error: null,
      })
    }
  }, [isAuthenticated, user?.id])

  // 体調記録を追加
  const addRecord = async (date: string, status: HealthStatus, notes?: string) => {
    try {
      const record = await HealthRecordsService.upsert(date, status, notes)

      setState((prev) => {
        const existingIndex = prev.records.findIndex((r) => r.date === date)
        const newRecords = [...prev.records]

        if (existingIndex >= 0) {
          newRecords[existingIndex] = record
        } else {
          newRecords.unshift(record)
          newRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        }

        return {
          ...prev,
          records: newRecords,
          error: null,
        }
      })

      // 統計を再計算
      await refreshStats()

      return record
    } catch (error) {
      logError(error, "useHealthRecords.addRecord")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // 日付で体調記録を更新
  const updateRecordByDate = async (date: string, status: HealthStatus, notes?: string) => {
    return addRecord(date, status, notes)
  }

  // 体調記録を削除
  const deleteRecord = async (id: string) => {
    try {
      await HealthRecordsService.delete(id)

      setState((prev) => ({
        ...prev,
        records: prev.records.filter((r) => r.id !== id),
        error: null,
      }))

      // 統計を再計算
      await refreshStats()
    } catch (error) {
      logError(error, "useHealthRecords.deleteRecord")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({ ...prev, error: errorMessage }))
      throw error
    }
  }

  // 特定の日付の記録を取得
  const getRecordByDate = (date: string): HealthRecord | undefined => {
    return state.records.find((record) => record.date === date)
  }

  // 統計を更新
  const refreshStats = async () => {
    try {
      const stats = await HealthRecordsService.getStatistics()
      setState((prev) => ({ ...prev, stats }))
    } catch (error) {
      logError(error, "useHealthRecords.refreshStats")
    }
  }

  // サンプルデータを生成
  const generateSampleData = async (days = 30) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      await HealthRecordsService.generateSampleData(days)
      await fetchRecords() // データを再取得
    } catch (error) {
      logError(error, "useHealthRecords.generateSampleData")
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
    records: state.records,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    addRecord,
    updateRecordByDate,
    deleteRecord,
    getRecordByDate,
    generateSampleData,
    refreshStats,
    refetch: fetchRecords,
    clearError,
  }
}
