"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { HealthStatus } from "@/types/database"

type HealthRecord = {
  id: string
  user_id: string
  date: string
  status: HealthStatus
  score: number | null
  notes?: string
  created_at: string
  updated_at: string
}

type HealthCalendarProps = {
  healthRecords: HealthRecord[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

interface CalendarDay {
  date: number
  fullDate: string
  isCurrentMonth: boolean
  isToday: boolean
  status?: HealthStatus
}

export function HealthCalendar({
  healthRecords,
  selectedDate,
  onDateSelect,
}: HealthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()

  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = []
    const today = new Date()

    const prevMonth = new Date(year, month - 1, 0)
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = prevMonth.getDate() - i
      const fullDate = new Date(year, month - 1, date).toISOString().split("T")[0]
      days.push({
        date,
        fullDate,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    for (let date = 1; date <= lastDayOfMonth.getDate(); date++) {
      const fullDate = new Date(year, month, date).toISOString().split("T")[0]
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === date

      days.push({
        date,
        fullDate,
        isCurrentMonth: true,
        isToday,
      })
    }

    const remainingDays = 42 - days.length
    for (let date = 1; date <= remainingDays; date++) {
      const fullDate = new Date(year, month + 1, date).toISOString().split("T")[0]
      days.push({
        date,
        fullDate,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()

  const daysWithStatus = calendarDays.map((day) => {
    const record = healthRecords.find((r) => r.date === day.fullDate)
    return {
      ...day,
      status: record?.status,
    }
  })

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getStatusColor = (status?: HealthStatus, isSelected?: boolean) => {
    if (isSelected) return "ring-2 ring-blue-500"
    switch (status) {
      case "good":
        return "bg-green-500 hover:bg-green-600"
      case "normal":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "bad":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-100 hover:bg-gray-200"
    }
  }

  const getStatusText = (status?: HealthStatus) => {
    switch (status) {
      case "good":
        return "良好"
      case "normal":
        return "普通"
      case "bad":
        return "不調"
      default:
        return ""
    }
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {year}年{month + 1}月
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekdays.map((day) => (
            <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysWithStatus.map((day, index) => (
            <button
              key={index}
              onClick={() => day.isCurrentMonth && onDateSelect(new Date(day.fullDate))}
              disabled={!day.isCurrentMonth}
              className={`
                h-12 flex flex-col items-center justify-center text-sm rounded-md transition-colors
                ${day.isCurrentMonth ? "cursor-pointer" : "cursor-default opacity-30"}
                ${getStatusColor(day.status, selectedDate.toISOString().split("T")[0] === day.fullDate)}
              `}
            >
              <span className={`${day.status ? "text-white" : "text-gray-900"}`}>{day.date}</span>
              {day.status && <span className="text-xs text-white opacity-90">{getStatusText(day.status)}</span>}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>良好</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>普通</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>不調</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
