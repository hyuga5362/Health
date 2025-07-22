"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Database } from "lucide-react"

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
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
          <Database className="h-4 w-4" />
          データ連携
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-blue-700">
          Supabaseデータベースと連携しています。サンプルデータを生成して機能をお試しください。
        </p>
        <div className="space-y-2">
          <Button
            onClick={handleGenerateSampleData}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            サンプルデータを生成
          </Button>
          <p className="text-xs text-blue-600 text-center">過去30日分の体調データが作成されます</p>
        </div>
      </CardContent>
    </Card>
  )
}
