"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface CircularHealthChartProps {
  goodPercentage: number
  normalPercentage: number
  badPercentage: number
}

const COLORS = {
  good: "#22C55E", // green-500
  normal: "#EAB308", // yellow-500
  bad: "#EF4444", // red-500
}

export function CircularHealthChart({ goodPercentage, normalPercentage, badPercentage }: CircularHealthChartProps) {
  const data = [
    { name: "良い", value: goodPercentage, color: COLORS.good },
    { name: "普通", value: normalPercentage, color: COLORS.normal },
    { name: "悪い", value: badPercentage, color: COLORS.bad },
  ].filter((item) => item.value > 0) // 割合が0%のものは表示しない

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value}%`, name]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: "20px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
