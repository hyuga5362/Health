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
import { Badge } from "@/components/ui/badge"
import type { HealthRecord, HealthStatus } from "@/types/database"

interface HealthCalendarProps {
  healthRecords?: HealthRecord[]
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  onStatusChange?: (date: string, status: HealthStatus) => void
  weekStartsMonday?: boolean
}

export function HealthCalendar({
  healthRecords = [],
  selectedDate,
  onDateSelect,
  onStatusChange,
  weekStartsMonday = false,
}: HealthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // 月の開始日と終了日を取得
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  // カレンダーに表示する日付の範囲を取得（前月・翌月の日付も含む）
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: weekStartsMonday ? 1 : 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: weekStartsMonday ? 1 : 0 })

  // カレンダーに表示するすべての日付を取得
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // 曜日のヘッダー
  const weekDays = weekStartsMonday
    ? ["月", "火", "水", "木", "金", "土", "日"]
    : ["日", "月", "火", "水", "木", "金", "土"]

  // 特定の日付の体調記録を取得
  const getHealthRecord = (date: Date): HealthRecord | undefined => {
    const dateString = format(date, "yyyy-MM-dd")
    return healthRecords.find((record) => record.date === dateString)
  }

  // 体調ステータスに応じた色を取得
  const getStatusColor = (status: HealthStatus): string => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 border-green-200"
      case "normal":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "bad":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // 体調ステータスに応じた絵文字を取得
  const getStatusEmoji = (status: HealthStatus): string => {
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

  // 日付クリック時の処理
  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  // 前月に移動
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // 次月に移動
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{format(currentMonth, "yyyy年M月", { locale: ja })}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth} className="h-8 w-8 p-0 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth} className="h-8 w-8 p-0 bg-transparent">
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

          {/* カレンダーの日付 */}
          {calendarDays.map((date) => {
            const healthRecord = getHealthRecord(date)
            const isCurrentMonth = isSameMonth(date, currentMonth)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isToday = isSameDay(date, new Date())

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  h-12 flex flex-col items-center justify-center text-sm rounded-md transition-colors
                  ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                  ${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""}
                  ${isToday ? "bg-blue-100 font-semibold" : ""}
                  ${!isSelected && !isToday ? "hover:bg-gray-100" : ""}
                  ${healthRecord ? getStatusColor(healthRecord.status) : ""}
                `}
              >
                <span className="text-xs">{format(date, "d")}</span>
                {healthRecord && <span className="text-xs leading-none">{getStatusEmoji(healthRecord.status)}</span>}
              </button>
            )
          })}
        </div>

        {/* 凡例 */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            😊 良好
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            😐 普通
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            😷 不調
          </Badge>
        </div>

        {/* 選択された日付の情報 */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-900 mb-2">
              {format(selectedDate, "M月d日(E)", { locale: ja })}
            </h4>
            {(() => {
              const record = getHealthRecord(selectedDate)
              if (record) {
                return (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span>{getStatusEmoji(record.status)}</span>
                      <span className="text-sm">
                        {record.status === "good" ? "良好" : record.status === "normal" ? "普通" : "不調"}
                      </span>
                    </div>
                    {record.notes && <p className="text-sm text-gray-600">{record.notes}</p>}
                  </div>
                )
              } else {
                return <p className="text-sm text-gray-500">記録がありません</p>
              }
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
