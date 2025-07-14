"use client"

import { useState, useEffect } from "react"
import { supabase, type HealthRecord, type HealthStatus } from "@/lib/supabase"

export function useHealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase.from("health_records").select("*").order("date", { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error("Error fetching health records:", error)
    } finally {
      setLoading(false)
    }
  }

  const addRecord = async (date: string, status: HealthStatus, notes?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("health_records")
        .upsert(
          {
            user_id: user.id,
            date,
            status,
            notes,
          },
          { onConflict: "user_id,date" },
        )
        .select()

      if (error) throw error
      await fetchRecords()
      return data
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
