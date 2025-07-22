"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { HealthStatus } from "@/types/database"

interface HealthStatusButtonsProps {
  selectedStatus?: HealthStatus | null
  onStatusSelect: (status: HealthStatus) => void
  disabled?: boolean
}

export function HealthStatusButtons({ selectedStatus, onStatusSelect, disabled }: HealthStatusButtonsProps) {
  const statuses: { value: HealthStatus; label: string; emoji: string; colorClass: string }[] = [
    { value: "good", label: "良い", emoji: "😊", colorClass: "bg-green-500 hover:bg-green-600" },
    { value: "normal", label: "普通", emoji: "😐", colorClass: "bg-yellow-500 hover:bg-yellow-600" },
    { value: "bad", label: "悪い", emoji: "😷", colorClass: "bg-red-500 hover:bg-red-600" },
  ]

  return (
    <div className="flex justify-around gap-2">
      {statuses.map((status) => (
        <Button
          key={status.value}
          variant="outline"
          className={cn(
            "flex-1 h-20 flex flex-col items-center justify-center text-lg font-semibold rounded-lg transition-all duration-200",
            selectedStatus === status.value
              ? `${status.colorClass} text-white scale-105 shadow-md`
              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          onClick={() => onStatusSelect(status.value)}
          disabled={disabled}
        >
          <span className="text-3xl mb-1">{status.emoji}</span>
          <span>{status.label}</span>
        </Button>
      ))}
    </div>
  )
}
