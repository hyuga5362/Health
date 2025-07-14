"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CircularHealthChartProps {
  good: number
  normal: number
  bad: number
  title?: string
  size?: number
}

export function CircularHealthChart({ good, normal, bad, title, size = 200 }: CircularHealthChartProps) {
  const total = good + normal + bad

  if (total === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          {title && <CardTitle className="text-base font-medium text-gray-800 text-center">{title}</CardTitle>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center" style={{ height: size }}>
            <div
              className="rounded-full border-8 border-gray-200 flex items-center justify-center"
              style={{ width: size * 0.8, height: size * 0.8 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">0</div>
                <div className="text-sm text-gray-500">記録なし</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const goodPercentage = (good / total) * 100
  const normalPercentage = (normal / total) * 100
  const badPercentage = (bad / total) * 100

  // SVG用の角度計算
  const goodAngle = (good / total) * 360
  const normalAngle = (normal / total) * 360
  const badAngle = (bad / total) * 360

  const radius = size * 0.35
  const strokeWidth = size * 0.1
  const normalizedRadius = radius - strokeWidth * 0.5
  const circumference = normalizedRadius * 2 * Math.PI

  // パスの計算
  const goodStrokeDasharray = `${(goodAngle / 360) * circumference} ${circumference}`
  const normalStrokeDasharray = `${(normalAngle / 360) * circumference} ${circumference}`
  const badStrokeDasharray = `${(badAngle / 360) * circumference} ${circumference}`

  const goodOffset = 0
  const normalOffset = -(goodAngle / 360) * circumference
  const badOffset = -((goodAngle + normalAngle) / 360) * circumference

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        {title && <CardTitle className="text-base font-medium text-gray-800 text-center">{title}</CardTitle>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* 円形グラフ */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
              {/* 背景円 */}
              <circle
                stroke="#f3f4f6"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={size / 2}
                cy={size / 2}
              />

              {/* 良い日 (緑) */}
              {good > 0 && (
                <circle
                  stroke="#10b981"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={goodStrokeDasharray}
                  strokeDashoffset={goodOffset}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={size / 2}
                  cy={size / 2}
                />
              )}

              {/* 普通の日 (黄) */}
              {normal > 0 && (
                <circle
                  stroke="#f59e0b"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={normalStrokeDasharray}
                  strokeDashoffset={normalOffset}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={size / 2}
                  cy={size / 2}
                />
              )}

              {/* 悪い日 (赤) */}
              {bad > 0 && (
                <circle
                  stroke="#ef4444"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={badStrokeDasharray}
                  strokeDashoffset={badOffset}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={size / 2}
                  cy={size / 2}
                />
              )}
            </svg>

            {/* 中央のテキスト */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{total}</div>
                <div className="text-sm text-gray-500">記録日数</div>
              </div>
            </div>
          </div>

          {/* 凡例 */}
          <div className="grid grid-cols-3 gap-4 text-center w-full">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">良い</span>
              </div>
              <div className="text-lg font-bold text-green-600">{good}</div>
              <div className="text-xs text-gray-500">{goodPercentage.toFixed(1)}%</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">普通</span>
              </div>
              <div className="text-lg font-bold text-yellow-600">{normal}</div>
              <div className="text-xs text-gray-500">{normalPercentage.toFixed(1)}%</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">悪い</span>
              </div>
              <div className="text-lg font-bold text-red-600">{bad}</div>
              <div className="text-xs text-gray-500">{badPercentage.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
