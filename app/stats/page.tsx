"use client"

import { useState } from "react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { ja } from "date-fns/locale"
import { ArrowLeft, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularHealthChart } from "@/components/circular-health-chart"
import { useHealthRecords } from "@/hooks/use-health-records"
import Link from "next/link"

export default function StatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "all">("month")
  const { records, loading } = useHealthRecords()

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 })
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const getStatsForPeriod = (start?: Date, end?: Date) => {
    let filteredRecords = records

    if (start && end) {
      filteredRecords = records.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate >= start && recordDate <= end
      })
    }

    return {
      good: filteredRecords.filter((r) => r.status === "good").length,
      normal: filteredRecords.filter((r) => r.status === "normal").length,
      bad: filteredRecords.filter((r) => r.status === "bad").length,
      total: filteredRecords.length,
    }
  }

  const weekStats = getStatsForPeriod(weekStart, weekEnd)
  const monthStats = getStatsForPeriod(monthStart, monthEnd)
  const allTimeStats = getStatsForPeriod()

  // 過去3ヶ月の月別統計
  const monthlyHistory = []
  for (let i = 0; i < 3; i++) {
    const targetMonth = subMonths(now, i)
    const monthStart = startOfMonth(targetMonth)
    const monthEnd = endOfMonth(targetMonth)
    const stats = getStatsForPeriod(monthStart, monthEnd)

    monthlyHistory.push({
      month: format(targetMonth, "yyyy年M月", { locale: ja }),
      ...stats,
    })
  }

  const getCurrentStats = () => {
    switch (selectedPeriod) {
      case "week":
        return { stats: weekStats, title: "今週の体調" }
      case "month":
        return { stats: monthStats, title: "今月の体調" }
      case "all":
        return { stats: allTimeStats, title: "全期間の体調" }
      default:
        return { stats: monthStats, title: "今月の体調" }
    }
  }

  const { stats, title } = getCurrentStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              <h1 className="text-lg font-semibold text-gray-800">体調統計</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 期間選択 */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-gray-800">表示期間</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {[
                { key: "week", label: "今週" },
                { key: "month", label: "今月" },
                { key: "all", label: "全期間" },
              ].map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.key as "week" | "month" | "all")}
                  className={
                    selectedPeriod === period.key
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* メイン円グラフ */}
        <CircularHealthChart good={stats.good} normal={stats.normal} bad={stats.bad} title={title} size={240} />

        {/* 月別履歴 */}
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              月別履歴
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {monthlyHistory.map((monthData, index) => (
              <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">{monthData.month}</h3>
                  <span className="text-sm text-gray-500">計 {monthData.total}日</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-600">良い: {monthData.good}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">普通: {monthData.normal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                    <span className="text-gray-600">悪い: {monthData.bad}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 体調傾向分析 */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-blue-800">体調傾向分析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-blue-700">
              {stats.total > 0 ? (
                <>
                  <p className="mb-2">
                    📊 <strong>{title}</strong>で合計<strong>{stats.total}日</strong>記録されています。
                  </p>
                  <p className="mb-2">
                    😊 良い日が<strong>{((stats.good / stats.total) * 100).toFixed(1)}%</strong>
                    {stats.good / stats.total >= 0.6
                      ? " - とても良好です！"
                      : stats.good / stats.total >= 0.4
                        ? " - まずまずの調子です。"
                        : " - 体調管理に注意しましょう。"}
                  </p>
                  {stats.bad > 0 && (
                    <p>
                      😷 体調の悪い日が{stats.bad}日ありました。
                      {stats.bad / stats.total > 0.3 ? "無理をせず休息を心がけましょう。" : ""}
                    </p>
                  )}
                </>
              ) : (
                <p>まだデータがありません。日々の体調を記録してみましょう！</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
