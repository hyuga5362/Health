"use client"

import { Button } from "@/components/ui/button"
import type { HealthStatus } from "@/lib/local-storage"

interface HealthStatusButtonsProps {
  selectedStatus?: HealthStatus
  onStatusSelect: (status: HealthStatus) => void
  disabled?: boolean
}

export function HealthStatusButtons({ selectedStatus, onStatusSelect, disabled }: HealthStatusButtonsProps) {
  const statusConfig = {
    good: {
      label: "良い",
      emoji: "😊",
      className: "bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50",
    },
    normal: {
      label: "普通",
      emoji: "😐",
      className: "bg-gray-400 text-white hover:bg-gray-500",
    },
    bad: {
      label: "悪い",
      emoji: "😷",
      className: "bg-gray-800 text-white hover:bg-gray-900",
    },
  }

  return (
    <div className="flex gap-3 justify-center">
      {Object.entries(statusConfig).map(([status, config]) => (
        <Button
          key={status}
          onClick={() => onStatusSelect(status as HealthStatus)}
          disabled={disabled}
          className={`
            flex-1 h-16 flex flex-col items-center justify-center gap-1 rounded-xl transition-all
            ${config.className}
            ${selectedStatus === status ? "ring-2 ring-orange-400 ring-offset-2" : ""}
          `}
          variant="outline"
        >
          <span className="text-xl">{config.emoji}</span>
          <span className="text-sm font-medium">{config.label}</span>
        </Button>
      ))}
    </div>
  )
}
