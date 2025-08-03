import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ message: "User ID and email are required." }, { status: 400 })
    }

    // ここに実際のメール送信ロジックを実装します。
    // 例: Resend, SendGrid, Nodemailer などのサービスを使用
    // 現時点では、コンソールにログを出力するのみです。
    console.log(`
--- Sending Test Notification ---
To: ${email} (User ID: ${userId})
Subject: Health Calendar App - Test Notification
Body: This is a test notification from your Health Calendar App.
---------------------------------
`)

    // 実際のメール送信には時間がかかる場合があるため、非同期処理をシミュレート
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({ message: "Test notification sent successfully (simulated)." })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json({ message: "Failed to send test notification." }, { status: 500 })
  }
}
