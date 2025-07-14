"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

interface SampleDataGeneratorProps {
  onDataGenerated: () => Promise<void>
}

export function SampleDataGenerator({ onDataGenerated }: SampleDataGeneratorProps) {
  const handleGenerateSampleData = async () => {
    try {
      await onDataGenerated()
    } catch (error) {
      console.error("Error generating sample data:", error)
    }
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          プロトタイプ版
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-blue-700">
          Supabaseデータベースを使用しています。 サンプルデータを生成して機能をお試しください。
        </p>
        <Button
          onClick={handleGenerateSampleData}
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          サンプルデータを生成
        </Button>
      </CardContent>
    </Card>
  )
}
