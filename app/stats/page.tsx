"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, subDays } from "date-fns"
import { CalendarDays, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHealthRecords } from "@/hooks/use-health-records"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { CircularHealthChart } from "@/components/circular-health-chart"
import Link from "next/link"

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState("30") // '7', '30', '90', 'all'
  const { records, loading, error, refetch } = useHealthRecords()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (error) {
      toast({
        title: "統計の読み込みに失敗しました",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const filterRecordsByTimeRange = (allRecords: typeof records) => {
    const today = new Date()
    let startDate: Date | null = null

    switch (timeRange) {
      case "7":
        startDate = subDays(today, 6) // 今日を含めて7日間
        break
      case "30":
        startDate = subDays(today, 29) // 今日を含めて30日間
        break
      case "90":
        startDate = subDays(today, 89) // 今日を含めて90日間
        break
      case "all":
      default:
        return allRecords
    }

    const startDateString = format(startDate, "yyyy-MM-dd")
    return allRecords.filter((record) => record.date >= startDateString)
  }

  const filteredRecords = filterRecordsByTimeRange(records)

  const totalRecords = filteredRecords.length
  const goodCount = filteredRecords.filter((r) => r.status === "good").length
  const normalCount = filteredRecords.filter((r) => r.status === "normal").length
  const badCount = filteredRecords.filter((r) => r.status === "bad").length

  const goodPercentage = totalRecords > 0 ? Math.round((goodCount / totalRecords) * 100) : 0
  const normalPercentage = totalRecords > 0 ? Math.round((normalCount / totalRecords) * 100) : 0
  const badPercentage = totalRecords > 0 ? Math.round((badCount / totalRecords) * 100) : 0

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

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">統計</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium text-gray-800">期間選択</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              表示する統計データの期間を選択してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="期間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">過去7日間</SelectItem>
                <SelectItem value="30">過去30日間</SelectItem>
                <SelectItem value="90">過去90日間</SelectItem>
                <SelectItem value="all">全期間</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium text-gray-800">体調割合</CardTitle>
            <CardDescription className="text-sm text-gray-500">選択期間における体調の割合です。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-4">
            {totalRecords > 0 ? (
              <CircularHealthChart
                goodPercentage={goodPercentage}
                normalPercentage={normalPercentage}
                badPercentage={badPercentage}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>この期間の記録がありません。</p>
                <p>ホーム画面から体調を記録しましょう。</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium text-gray-800">詳細統計</CardTitle>
            <CardDescription className="text-sm text-gray-500">選択期間の体調記録の詳細です。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">総記録数</span>
              <span className="text-sm font-medium text-gray-800">{totalRecords}日</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">良い体調の日</span>
              <span className="text-sm font-medium text-green-600">
                {goodCount}日 ({goodPercentage}%)
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">普通の体調の日</span>
              <span className="text-sm font-medium text-yellow-600">
                {normalCount}日 ({normalPercentage}%)
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">悪い体調の日</span>
              <span className="text-sm font-medium text-red-600">
                {badCount}日 ({badPercentage}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
