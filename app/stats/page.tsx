"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, CalendarIcon, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularHealthChart } from "@/components/circular-health-chart"
import { useHealthRecords } from "@/hooks/use-health-records"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function StatsPage() {
  const { records, loading } = useHealthRecords()
  const { loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">統計を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // リダイレクト中
  }

  // 統計データの計算
  const totalRecords = records.length
  const goodDays = records.filter((r) => r.status === "good").length
  const normalDays = records.filter((r) => r.status === "normal").length
  const badDays = records.filter((r) => r.status === "bad").length

  const goodPercentage = totalRecords > 0 ? Math.round((goodDays / totalRecords) * 100) : 0
  const normalPercentage = totalRecords > 0 ? Math.round((normalDays / totalRecords) * 100) : 0
  const badPercentage = totalRecords > 0 ? Math.round((badDays / totalRecords) * 100) : 0

  // 最近7日間の統計
  const last7Days = records.slice(0, 7)
  const last7DaysGood = last7Days.filter((r) => r.status === "good").length
  const last7DaysGoodPercentage = last7Days.length > 0 ? Math.round((last7DaysGood / last7Days.length) * 100) : 0

  // 最近30日間の統計
  const last30Days = records.slice(0, 30)
  const last30DaysGood = last30Days.filter((r) => r.status === "good").length
  const last30DaysGoodPercentage = last30Days.length > 0 ? Math.round((last30DaysGood / last30Days.length) * 100) : 0

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
              <BarChart3 className="h-6 w-6 text-orange-600" />
              <h1 className="text-lg font-semibold text-gray-800">統計</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {records.length === 0 ? (
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">まだ体調記録がありません</p>
              <p className="text-sm text-gray-500">体調を記録して統計を確認しましょう</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 全体統計 */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  全体統計 ({totalRecords}日間)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <CircularHealthChart good={goodDays} normal={normalDays} bad={badDays} size={200} />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{goodPercentage}%</div>
                    <div className="text-xs text-gray-500">良い ({goodDays}日)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{normalPercentage}%</div>
                    <div className="text-xs text-gray-500">普通 ({normalDays}日)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{badPercentage}%</div>
                    <div className="text-xs text-gray-500">悪い ({badDays}日)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 期間別統計 */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium text-gray-800">期間別統計</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">最近7日間</p>
                    <p className="text-xs text-gray-500">良い日の割合</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">{last7DaysGoodPercentage}%</div>
                    <div className="text-xs text-gray-500">
                      {last7DaysGood}/{last7Days.length}日
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">最近30日間</p>
                    <p className="text-xs text-gray-500">良い日の割合</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">{last30DaysGoodPercentage}%</div>
                    <div className="text-xs text-gray-500">
                      {last30DaysGood}/{last30Days.length}日
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 詳細データ */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium text-gray-800">詳細データ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">記録開始日</span>
                    <span className="font-medium">
                      {records.length > 0
                        ? new Date(records[records.length - 1].date).toLocaleDateString("ja-JP")
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">最新記録日</span>
                    <span className="font-medium">
                      {records.length > 0 ? new Date(records[0].date).toLocaleDateString("ja-JP") : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">記録日数</span>
                    <span className="font-medium">{totalRecords}日</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">平均体調</span>
                    <span className="font-medium">
                      {totalRecords > 0
                        ? goodPercentage >= 50
                          ? "良好"
                          : normalPercentage >= 50
                            ? "普通"
                            : "要注意"
                        : "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
