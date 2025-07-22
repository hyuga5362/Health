"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface SampleDataGeneratorProps {
  onDataGenerated: () => Promise<void>
}

export function SampleDataGenerator({ onDataGenerated }: SampleDataGeneratorProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onDataGenerated()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-gray-800">サンプルデータ生成</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          アプリの機能を試すために、過去30日間のランダムな体調データを生成します。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleClick} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            "サンプルデータを生成"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
