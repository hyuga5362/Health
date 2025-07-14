"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ja } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { HealthRecord } from "@/lib/supabase"

interface HealthCalendarProps {
  healthRecords: HealthRecord[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export function HealthCalendar({ healthRecords, selectedDate, onDateSelect }: HealthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getHealthStatus = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const record = healthRecords.find((record) => record.date === dateString)
    return record?.status
  }

  const getStatusColor = (status?: string) => {
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

  const getStatusEmoji = (status?: string) => {
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

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  return (
    <div className="space-y-4">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={previousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{format(currentMonth, "yyyy年M月", { locale: ja })}</h2>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
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
                ${isSelected ? "ring-2 ring-orange-500 ring-offset-1" : ""}
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
      <div className="flex justify-center gap-4 text-xs">
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
    </div>
  )
}
