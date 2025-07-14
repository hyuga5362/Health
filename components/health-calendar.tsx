"use client"

import { Calendar } from "@/components/ui/calendar"
import type { HealthRecord } from "@/lib/local-storage"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface HealthCalendarProps {
  healthRecords: HealthRecord[]
  selectedDate?: Date
  onDateSelect: (date: Date | undefined) => void
}

export function HealthCalendar({ healthRecords, selectedDate, onDateSelect }: HealthCalendarProps) {
  const getHealthStatusForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const record = healthRecords.find((record) => record.date === dateString)
    return record?.status
  }

  const modifiers = {
    good: (date: Date) => getHealthStatusForDate(date) === "good",
    normal: (date: Date) => getHealthStatusForDate(date) === "normal",
    bad: (date: Date) => getHealthStatusForDate(date) === "bad",
  }

  const modifiersStyles = {
    good: {
      backgroundColor: "#fef3c7",
      color: "#92400e",
      fontWeight: "bold",
    },
    normal: {
      backgroundColor: "#e5e7eb",
      color: "#374151",
      fontWeight: "bold",
    },
    bad: {
      backgroundColor: "#374151",
      color: "#ffffff",
      fontWeight: "bold",
    },
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        locale={ja}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rounded-md border-0"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium text-gray-700",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-orange-100 transition-colors",
          day_selected:
            "bg-orange-200 text-orange-900 hover:bg-orange-200 hover:text-orange-900 focus:bg-orange-200 focus:text-orange-900",
          day_today: "bg-orange-100 text-orange-900 font-semibold",
          day_outside: "text-gray-400 opacity-50",
          day_disabled: "text-gray-400 opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
      />
    </div>
  )
}
