"use client"

import { useState, useEffect, useCallback } from "react"
import { HealthRecordsService, type HealthRecordFilters } from "@/services/health-records.service"
import type { HealthRecord, HealthStatus } from "@/types/database"
import { useAuth } from "./use-auth"

export function useHealthRecords(filters: HealthRecordFilters = {}) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  const fetchRecords = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setRecords([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await HealthRecordsService.getAll(filters)
      setRecords(data)
    } catch (err: any) {
      setError(err.message || "データの取得に失敗しました。")
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, JSON.stringify(filters)])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // リアルタイム更新の監視
  useEffect(() => {
    if (!user) return

    const subscription = HealthRecordsService.subscribeToChanges(user.id, (payload) => {
      console.log("Health record changed:", payload)
      fetchRecords() // データを再取得
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchRecords])

  const addRecord = async (date: string, status: HealthStatus, notes?: string) => {
    try {
      const newRecord = await HealthRecordsService.upsertByDate(date, status, notes)

      // ローカル状態を更新
      setRecords((prev) => {
        const filtered = prev.filter((record) => record.date !== date)
        return [newRecord, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      })

      return newRecord
    } catch (err: any) {
      setError(err.message || "記録の追加に失敗しました。")
      throw err
    }
  }

  const updateRecord = async (id: string, updates: Partial<HealthRecord>) => {
    try {
      const updatedRecord = await HealthRecordsService.update(id, updates)

      // ローカル状態を更新
      setRecords((prev) => prev.map((record) => (record.id === id ? updatedRecord : record)))

      return updatedRecord
    } catch (err: any) {
      setError(err.message || "記録の更新に失敗しました。")
      throw err
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      await HealthRecordsService.delete(id)

      // ローカル状態を更新
      setRecords((prev) => prev.filter((record) => record.id !== id))
    } catch (err: any) {
      setError(err.message || "記録の削除に失敗しました。")
      throw err
    }
  }

  const getRecordByDate = (date: string): HealthRecord | undefined => {
    return records.find((record) => record.date === date)
  }

  const generateSampleData = async (days = 30) => {
    try {
      setLoading(true)
      await HealthRecordsService.generateSampleData(days)
      await fetchRecords()
    } catch (err: any) {
      setError(err.message || "サンプルデータの生成に失敗しました。")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getStats = async (statsFilters?: HealthRecordFilters) => {
    try {
      return await HealthRecordsService.getStats(statsFilters || filters)
    } catch (err: any) {
      setError(err.message || "統計データの取得に失敗しました。")
      throw err
    }
  }

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordByDate,
    generateSampleData,
    getStats,
    refetch: fetchRecords,
    clearError: () => setError(null),
  }
}
