"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ja } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HealthRecord, HealthStatus } from "@/types/database"

interface HealthCalendarProps {
  healthRecords: HealthRecord[] // 親コンポーネントから渡される
  selectedDate: Date // 親コンポーネントから渡される
  onDateSelect: (date: Date) => void // 親コンポーネントから渡される
  weekStartsMonday?: boolean
}

export function HealthCalendar({
  healthRecords,
  selectedDate,
  onDateSelect,
  weekStartsMonday = false,
}: HealthCalendarProps) {
  // selectedDate を基準に現在の月を決定
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  // 月の開始日と終了日を取得
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  // カレンダーに表示する日付の範囲を取得（前月・翌月の日付も含む）
  // weekStartsOn: 0 は日曜日開始、1 は月曜日開始
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: weekStartsMonday ? 1 : 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: weekStartsMonday ? 1 : 0 })

  // カレンダーに表示するすべての日付を取得
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // 曜日のヘッダー
  const weekDays = weekStartsMonday
    ? ["月", "火", "水", "木", "金", "土", "日"]
    : ["日", "月", "火", "水", "木", "金", "土"]

  // 特定の日付の体調記録を取得
  const getHealthStatus = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const record = healthRecords.find((record) => record.date === dateString)
    return record?.status
  }

  // 体調ステータスに応じた色を取得
  const getStatusColor = (status?: HealthStatus) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 border-green-200"
      case "normal":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "bad":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  // 体調ステータスに応じた絵文字を取得
  const getStatusEmoji = (status?: HealthStatus) => {
    switch (status) {
      case "good":
        return "😊"
      case "normal":
        return "😐"
      case "bad":
        return "😷"
      default:
        return ""
    }
  }

  // 前月に移動
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // 次月に移動
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{format(currentMonth, "yyyy年M月", { locale: ja })}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={previousMonth} className="h-8 w-8 p-0 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0 bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* 曜日ヘッダー */}
          {weekDays.map((day) => (
            <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* カレンダーグリッド */}
          {days.map((day) => {
            const status = getHealthStatus(day)
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentMonth = isSameMonth(day, currentMonth)

            return (
              <button
                key={day.toString()}
                onClick={() => onDateSelect(day)}
                className={`
                  relative h-12 p-1 text-sm border rounded-lg transition-colors
                  ${isSelected ? "ring-2 ring-orange-500 ring-offset-1 bg-orange-100 opacity-70" : ""}
                  ${isCurrentMonth ? getStatusColor(status) : "bg-gray-50 text-gray-400 border-gray-100"}
                  ${isCurrentMonth ? "hover:opacity-80" : ""}
                `}
                disabled={!isCurrentMonth}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-xs ${isCurrentMonth ? "" : "text-gray-400"}`}>{format(day, "d")}</span>
                  {status && isCurrentMonth && <span className="text-xs">{getStatusEmoji(status)}</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-gray-600">良い</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span className="text-gray-600">普通</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-gray-600">悪い</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
