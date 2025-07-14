"use client"

import { useState, useEffect } from "react"
import { supabase, type HealthRecord, type HealthStatus } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

export function useHealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  const fetchRecords = async () => {
    if (!isAuthenticated || !user) {
      setRecords([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error("Error fetching health records:", error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const addRecord = async (date: string, status: HealthStatus, notes?: string) => {
    if (!isAuthenticated || !user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("health_records")
      .upsert(
        {
          user_id: user.id,
          date,
          status,
          notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,date" },
      )
      .select()
      .single()

    if (error) throw error

    // ローカル状態を更新
    setRecords((prev) => {
      const filtered = prev.filter((record) => record.date !== date)
      return [data, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })

    return data
  }

  const getRecordByDate = (date: string): HealthRecord | undefined => {
    return records.find((record) => record.date === date)
  }

  useEffect(() => {
    fetchRecords()
  }, [isAuthenticated, user])

  return {
    records,
    loading,
    addRecord,
    getRecordByDate,
    refetch: fetchRecords,
  }
}
