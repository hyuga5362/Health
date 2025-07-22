// カスタムエラークラス
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
    this.field = field
  }
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

export function validateHealthStatus(status: string): boolean {
  return ["good", "normal", "bad"].includes(status)
}

export function validateTheme(theme: string): boolean {
  return ["light", "dark", "system"].includes(theme)
}

// Supabaseエラーハンドリング
export function handleSupabaseError(error: any): never {
  console.error("Supabase Operation Error:", error)
  if (error.code) {
    throw new DatabaseError(`データベースエラーが発生しました: ${error.message} (Code: ${error.code})`, error.code)
  } else if (error.message) {
    throw new DatabaseError(`操作に失敗しました: ${error.message}`)
  } else {
    throw new DatabaseError("不明なデータベースエラーが発生しました。")
  }
}

// エラーメッセージを取得
export function getErrorMessage(error: any): string {
  if (error instanceof DatabaseError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return "不明なエラーが発生しました。"
}

// ログ出力
export function logError(error: any, context = "Application") {
  console.error(`[ERROR] ${context}:`, error)
  if (error.stack) {
    console.error(error.stack)
  }
}
