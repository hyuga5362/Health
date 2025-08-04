"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, BarChart3 } from "lucide-react"
import type { HealthRecord } from "@/lib/supabase"

interface HealthStatsProps {
  healthRecords: HealthRecord[]
}

export function HealthStats({ healthRecords }: HealthStatsProps) {
  if (healthRecords.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            統計概要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">まだ体調記録がありません</p>
        </CardContent>
      </Card>
    )
  }

  const totalRecords = healthRecords.length
  const goodDays = healthRecords.filter((record) => record.status === "good").length
  const normalDays = healthRecords.filter((record) => record.status === "normal").length
  const badDays = healthRecords.filter((record) => record.status === "bad").length

  const goodPercentage = Math.round((goodDays / totalRecords) * 100)
  const normalPercentage = Math.round((normalDays / totalRecords) * 100)
  const badPercentage = Math.round((badDays / totalRecords) * 100)

  // 最近7日間の統計
  const recentRecords = healthRecords.slice(0, 7)
  const recentGoodDays = recentRecords.filter((record) => record.status === "good").length
  const recentTrend = recentRecords.length > 0 ? Math.round((recentGoodDays / recentRecords.length) * 100) : 0

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          統計概要
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 全体統計 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">{goodDays}</div>
            <div className="text-xs text-gray-500">良い日</div>
            <div className="text-xs text-green-600">{goodPercentage}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-yellow-600">{normalDays}</div>
            <div className="text-xs text-gray-500">普通の日</div>
            <div className="text-xs text-yellow-600">{normalPercentage}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600">{badDays}</div>
            <div className="text-xs text-gray-500">悪い日</div>
            <div className="text-xs text-red-600">{badPercentage}%</div>
          </div>
        </div>

        {/* 最近の傾向 */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">最近7日間</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{recentTrend}%</div>
            <div className="text-xs text-gray-500">良い日の割合</div>
          </div>
        </div>

        {/* 記録日数 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">記録日数</span>
          </div>
          <div className="text-lg font-bold text-gray-800">{totalRecords}日</div>
        </div>
      </CardContent>
    </Card>
  )
}
