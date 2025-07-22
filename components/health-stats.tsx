"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { HealthRecord } from "@/types/database"

interface HealthStatsProps {
  healthRecords: HealthRecord[]
}

export function HealthStats({ healthRecords }: HealthStatsProps) {
  const totalRecords = healthRecords.length
  const goodCount = healthRecords.filter((r) => r.status === "good").length
  const normalCount = healthRecords.filter((r) => r.status === "normal").length
  const badCount = healthRecords.filter((r) => r.status === "bad").length

  const goodPercentage = totalRecords > 0 ? Math.round((goodCount / totalRecords) * 100) : 0
  const normalPercentage = totalRecords > 0 ? Math.round((normalCount / totalRecords) * 100) : 0
  const badPercentage = totalRecords > 0 ? Math.round((badCount / totalRecords) * 100) : 0

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-gray-800">体調統計</CardTitle>
        <CardDescription className="text-sm text-gray-500">これまでの体調記録の概要です。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>良い ({goodCount}日)</span>
            <span>{goodPercentage}%</span>
          </div>
          <Progress
            value={goodPercentage}
            className="h-2 bg-green-200 [&::-webkit-progress-bar]:bg-green-500 [&::-webkit-progress-value]:bg-green-500 [&::moz-progress-bar]:bg-green-500"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>普通 ({normalCount}日)</span>
            <span>{normalPercentage}%</span>
          </div>
          <Progress
            value={normalPercentage}
            className="h-2 bg-yellow-200 [&::-webkit-progress-bar]:bg-yellow-500 [&::-webkit-progress-value]:bg-yellow-500 [&::moz-progress-bar]:bg-yellow-500"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>悪い ({badCount}日)</span>
            <span>{badPercentage}%</span>
          </div>
          <Progress
            value={badPercentage}
            className="h-2 bg-red-200 [&::-webkit-progress-bar]:bg-red-500 [&::-webkit-progress-value]:bg-red-500 [&::moz-progress-bar]:bg-red-500"
          />
        </div>
        <div className="text-sm text-gray-500 text-center pt-2">総記録日数: {totalRecords}日</div>
      </CardContent>
    </Card>
  )
}
