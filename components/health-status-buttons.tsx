"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import type { HealthStatus } from "@/lib/supabase"

interface HealthStatusButtonsProps {
  selectedStatus?: HealthStatus
  onStatusSelect: (status: HealthStatus) => void
  disabled?: boolean
}

export function HealthStatusButtons({ selectedStatus, onStatusSelect, disabled }: HealthStatusButtonsProps) {
  const statuses = [
    {
      value: "good" as const,
      label: "良い",
      emoji: "😊",
      color: "bg-green-500 hover:bg-green-600 text-white",
      selectedColor: "bg-green-600 text-white",
    },
    {
      value: "normal" as const,
      label: "普通",
      emoji: "😐",
      color: "bg-yellow-500 hover:bg-yellow-600 text-white",
      selectedColor: "bg-yellow-600 text-white",
    },
    {
      value: "bad" as const,
      label: "悪い",
      emoji: "😷",
      color: "bg-red-500 hover:bg-red-600 text-white",
      selectedColor: "bg-red-600 text-white",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {statuses.map((status) => (
        <Button
          key={status.value}
          onClick={() => onStatusSelect(status.value)}
          disabled={disabled}
          className={`h-20 flex flex-col gap-1 ${
            selectedStatus === status.value ? status.selectedColor : status.color
          }`}
          variant={selectedStatus === status.value ? "default" : "outline"}
        >
          <span className="text-2xl">{status.emoji}</span>
          <span className="text-sm font-medium">{status.label}</span>
        </Button>
      ))}
    </div>
  )
}
