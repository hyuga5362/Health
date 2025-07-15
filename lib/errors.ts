import type { HealthStatus, Theme } from "@/types/database"

// カスタムエラークラス
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code = "UNKNOWN_ERROR", statusCode = 500) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "DatabaseError"
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

export class NotFoundError extends AppError {
  constructor(message = "リソースが見つかりません", code = "NOT_FOUND") {
    super(message, code, 404)
  }
}

// Supabaseエラーハンドリング
export function handleSupabaseError(error: any): never {
  if (!error) {
    throw new Error("Unknown error occurred")
  }

  // Supabase Auth Error
  if (error.message && typeof error.message === "string") {
    const message = error.message.toLowerCase()

    if (message.includes("invalid login credentials")) {
      throw new AuthError("メールアドレスまたはパスワードが正しくありません。")
    }

    if (message.includes("email not confirmed")) {
      throw new AuthError("メールアドレスの確認が完了していません。メールをご確認ください。")
    }

    if (message.includes("user already registered")) {
      throw new AuthError("このメールアドレスは既に登録されています。")
    }

    if (message.includes("password should be at least")) {
      throw new AuthError("パスワードは6文字以上で入力してください。")
    }

    if (message.includes("auth session missing")) {
      throw new AuthError("認証セッションが見つかりません。再度ログインしてください。")
    }
  }

  // PostgreSQL Error
  if (error.code) {
    switch (error.code) {
      case "23505":
        throw new DatabaseError("データが既に存在します。")
      case "23503":
        throw new DatabaseError("関連するデータが見つかりません。")
      case "42501":
        throw new DatabaseError("このデータにアクセスする権限がありません。")
      default:
        throw new DatabaseError(`データベースエラーが発生しました。(${error.code})`)
    }
  }

  // Generic error
  throw new Error(error.message || "予期しないエラーが発生しました。")
}

// バリデーション関数
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password) {
    return { isValid: false, message: "パスワードを入力してください。" }
  }

  if (password.length < 6) {
    return { isValid: false, message: "パスワードは6文字以上で入力してください。" }
  }

  return { isValid: true }
}

export function validateHealthStatus(status: string): status is HealthStatus {
  return ["good", "normal", "bad"].includes(status)
}

export function validateTheme(theme: string): theme is Theme {
  return ["light", "dark", "system"].includes(theme)
}

// エラーメッセージの日本語化
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "予期しないエラーが発生しました。"
}

// エラーログ出力
export function logError(error: unknown, context?: string): void {
  const errorMessage = getErrorMessage(error)
  const timestamp = new Date().toISOString()

  console.error(`${timestamp} ${context ? `[${context}]` : ""} ${errorMessage}`)

  // 本番環境では外部ログサービスに送信
  if (process.env.NODE_ENV === "production") {
    // TODO: Send to external logging service
  }
}
