"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Calendar, Settings, BarChart3, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { HealthStatusButtons } from "@/components/health-status-buttons"
import { HealthCalendar } from "@/components/health-calendar"
import { HealthStats } from "@/components/health-stats"
import { SampleDataGenerator } from "@/components/sample-data-generator"
import { useHealthRecords } from "@/hooks/use-health-records"
import { useAuth } from "@/hooks/use-auth"
import type { HealthStatus } from "@/types/database"
import Link from "next/link"

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isRecording, setIsRecording] = useState(false)
  const { records, loading, addRecord, getRecordByDate, generateSampleData } = useHealthRecords()
  const { user, loading: authLoading, isAuthenticated, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  const handleStatusSelect = async (status: HealthStatus) => {
    if (!selectedDate) return

    setIsRecording(true)
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      await addRecord(dateString, status)

      toast({
        title: "体調を記録しました",
        description: `${format(selectedDate, "M月d日", { locale: ja })}の体調: ${
          status === "good" ? "良い" : status === "normal" ? "普通" : "悪い"
        }`,
      })
    } catch (error: any) {
      toast({
        title: "エラーが発生しました",
        description: error.message || "体調の記録に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setIsRecording(false)
    }
  }

  const handleGenerateSampleData = async () => {
    try {
      await generateSampleData(30)
      toast({
        title: "サンプルデータを生成しました",
        description: "過去30日分の体調データを作成しました。",
      })
    } catch (error: any) {
      toast({
        title: "エラーが発生しました",
        description: error.message || "サンプルデータの生成に失敗しました。",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "ログアウトしました",
        description: "またのご利用をお待ちしております。",
      })
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "エラーが発生しました",
        description: error.message || "ログアウトに失敗しました。",
        variant: "destructive",
      })
    }
  }

  const selectedDateRecord = selectedDate ? getRecordByDate(format(selectedDate, "yyyy-MM-dd")) : null

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // リダイレクト中
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-orange-600" />
            <h1 className="text-lg font-semibold text-gray-800">健康カレンダー</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/stats">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="text-gray-600">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-gray-600" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* User Info */}
        {user && (
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 text-center">ようこそ、{user.email}さん</p>
            </CardContent>
          </Card>
        )}

        {/* Sample Data Generator */}
        {records.length === 0 && <SampleDataGenerator onDataGenerated={handleGenerateSampleData} />}

        {/* Stats Overview */}
        <HealthStats healthRecords={records} />

        {/* Calendar */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-gray-800">カレンダー</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthCalendar healthRecords={records} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          </CardContent>
        </Card>

        {/* Health Status Recording */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium text-gray-800">
              {selectedDate ? format(selectedDate, "M月d日の体調", { locale: ja }) : "体調記録"}
            </CardTitle>
            {selectedDateRecord && (
              <p className="text-sm text-gray-500">
                記録済み:{" "}
                {selectedDateRecord.status === "good"
                  ? "良い"
                  : selectedDateRecord.status === "normal"
                    ? "普通"
                    : "悪い"}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <HealthStatusButtons
              selectedStatus={selectedDateRecord?.status}
              onStatusSelect={handleStatusSelect}
              disabled={isRecording}
            />
            {selectedDate && (
              <p className="text-xs text-gray-500 text-center mt-3">
                タップして{format(selectedDate, "M月d日", { locale: ja })}の体調を記録
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Records */}
        {records.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium text-gray-800">最近の記録</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {records.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-sm text-gray-600">
                      {format(new Date(record.date), "M月d日(E)", { locale: ja })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {record.status === "good" ? "😊" : record.status === "normal" ? "😐" : "😷"}
                      </span>
                      <span className="text-sm font-medium">
                        {record.status === "good" ? "良い" : record.status === "normal" ? "普通" : "悪い"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
