"use client"

import { useState, useEffect } from "react"
import { localStorageAPI, type HealthRecord, type HealthStatus } from "@/lib/local-storage"

export function useHealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecords = () => {
    try {
      const data = localStorageAPI.getHealthRecords()
      // 日付順でソート（新しい順）
      const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecords(sorted)
    } catch (error) {
      console.error("Error fetching health records:", error)
    } finally {
      setLoading(false)
    }
  }

  const addRecord = async (date: string, status: HealthStatus, notes?: string) => {
    try {
      const newRecord = localStorageAPI.saveHealthRecord({
        date,
        status,
        notes,
      })
      fetchRecords() // データを再取得
      return newRecord
    } catch (error) {
      console.error("Error adding health record:", error)
      throw error
    }
  }

  const getRecordByDate = (date: string) => {
    return records.find((record) => record.date === date)
  }

  const getWeeklyStats = (startDate: Date) => {
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)

    const weekRecords = records.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })

    return {
      good: weekRecords.filter((r) => r.status === "good").length,
      normal: weekRecords.filter((r) => r.status === "normal").length,
      bad: weekRecords.filter((r) => r.status === "bad").length,
      total: weekRecords.length,
    }
  }

  const getMonthlyStats = (year: number, month: number) => {
    const monthRecords = records.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate.getFullYear() === year && recordDate.getMonth() === month
    })

    return {
      good: monthRecords.filter((r) => r.status === "good").length,
      normal: monthRecords.filter((r) => r.status === "normal").length,
      bad: monthRecords.filter((r) => r.status === "bad").length,
      total: monthRecords.length,
    }
  }

  const getAllTimeStats = () => {
    return {
      good: records.filter((r) => r.status === "good").length,
      normal: records.filter((r) => r.status === "normal").length,
      bad: records.filter((r) => r.status === "bad").length,
      total: records.length,
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  return {
    records,
    loading,
    addRecord,
    getRecordByDate,
    getWeeklyStats,
    getMonthlyStats,
    getAllTimeStats,
    refetch: fetchRecords,
  }
}
