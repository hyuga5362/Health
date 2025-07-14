"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CircularHealthChartProps {
  good: number
  normal: number
  bad: number
  title: string
  size?: number
}

export function CircularHealthChart({ good, normal, bad, title, size = 200 }: CircularHealthChartProps) {
  const total = good + normal + bad

  const chartData = useMemo(() => {
    if (total === 0) return []

    const goodPercentage = (good / total) * 100
    const normalPercentage = (normal / total) * 100
    const badPercentage = (bad / total) * 100

    // SVG円グラフのための角度計算
    const radius = 80
    const circumference = 2 * Math.PI * radius

    const goodStroke = (goodPercentage / 100) * circumference
    const normalStroke = (normalPercentage / 100) * circumference
    const badStroke = (badPercentage / 100) * circumference

    return [
      {
        label: "良い",
        value: good,
        percentage: goodPercentage,
        color: "#fef3c7",
        strokeColor: "#f59e0b",
        stroke: goodStroke,
        offset: 0,
      },
      {
        label: "普通",
        value: normal,
        percentage: normalPercentage,
        color: "#e5e7eb",
        strokeColor: "#6b7280",
        stroke: normalStroke,
        offset: goodStroke,
      },
      {
        label: "悪い",
        value: bad,
        percentage: badPercentage,
        color: "#374151",
        strokeColor: "#1f2937",
        stroke: badStroke,
        offset: goodStroke + normalStroke,
      },
    ].filter((item) => item.value > 0)
  }, [good, normal, bad, total])

  if (total === 0) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>データがありません</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {/* 円グラフ */}
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* 背景円 */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#f3f4f6" strokeWidth="16" />

            {/* データ円弧 */}
            {chartData.map((item, index) => (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.strokeColor}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${item.stroke} ${circumference - item.stroke}`}
                strokeDashoffset={-item.offset}
                className="transition-all duration-500 ease-in-out"
              />
            ))}
          </svg>

          {/* 中央のテキスト */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-800">{total}</div>
            <div className="text-sm text-gray-500">記録</div>
          </div>
        </div>

        {/* 凡例 */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {chartData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.strokeColor }} />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="text-lg font-bold text-gray-800">{item.value}</div>
              <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>

        {/* 詳細統計 */}
        <div className="w-full bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">最も多い状態:</span>
              <span className="ml-2 font-medium">
                {good >= normal && good >= bad ? "良い" : normal >= bad ? "普通" : "悪い"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">良い日の割合:</span>
              <span className="ml-2 font-medium text-yellow-600">{((good / total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
