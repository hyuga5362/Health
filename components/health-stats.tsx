"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HealthRecord } from "@/lib/local-storage"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { ja } from "date-fns/locale"

interface HealthStatsProps {
  healthRecords: HealthRecord[]
}

export function HealthStats({ healthRecords }: HealthStatsProps) {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 })
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const getStatsForPeriod = (start: Date, end: Date) => {
    const periodRecords = healthRecords.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate >= start && recordDate <= end
    })

    return {
      good: periodRecords.filter((r) => r.status === "good").length,
      normal: periodRecords.filter((r) => r.status === "normal").length,
      bad: periodRecords.filter((r) => r.status === "bad").length,
      total: periodRecords.length,
    }
  }

  const weekStats = getStatsForPeriod(weekStart, weekEnd)
  const monthStats = getStatsForPeriod(monthStart, monthEnd)

  const StatCard = ({ title, stats, period }: { title: string; stats: any; period: string }) => (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <p className="text-xs text-gray-400">{period}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">良い</span>
          <div className="flex items-center gap-2">
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-300 transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.good / stats.total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-medium w-6 text-right">{stats.good}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">普通</span>
          <div className="flex items-center gap-2">
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.normal / stats.total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-medium w-6 text-right">{stats.normal}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">悪い</span>
          <div className="flex items-center gap-2">
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-800 transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.bad / stats.total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-medium w-6 text-right">{stats.bad}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        title="今週の体調"
        stats={weekStats}
        period={`${format(weekStart, "M/d", { locale: ja })} - ${format(weekEnd, "M/d", { locale: ja })}`}
      />
      <StatCard title="今月の体調" stats={monthStats} period={format(now, "yyyy年M月", { locale: ja })} />
    </div>
  )
}
