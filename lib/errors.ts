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
  console.error("Supabase Error:", error)

  if (error?.code) {
    switch (error.code) {
      case "auth_session_missing":
        throw new AuthError("認証セッションが見つかりません。再度ログインしてください。", error.code)
      case "invalid_credentials":
        throw new AuthError("メールアドレスまたはパスワードが正しくありません。", error.code)
      case "email_not_confirmed":
        throw new AuthError("メールアドレスの確認が完了していません。", error.code)
      case "signup_disabled":
        throw new AuthError("新規登録は現在無効になっています。", error.code)
      case "email_address_invalid":
        throw new AuthError("有効なメールアドレスを入力してください。", error.code)
      case "password_too_short":
        throw new AuthError("パスワードは6文字以上で入力してください。", error.code)
      case "PGRST116":
        throw new DatabaseError("データが見つかりません。", error.code)
      case "23505":
        throw new DatabaseError("データが既に存在します。", error.code)
      case "23503":
        throw new DatabaseError("関連するデータが見つかりません。", error.code)
      default:
        throw new DatabaseError(error.message || "データベースエラーが発生しました。", error.code)
    }
  }

  throw new DatabaseError(error.message || "予期しないエラーが発生しました。")
}

// エラーメッセージを取得
export function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError || error instanceof DatabaseError || error instanceof ValidationError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "予期しないエラーが発生しました。"
}

// ログ出力
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}] ` : ""

  console.error(`${timestamp} ${contextStr}Error:`, error)

  // 本番環境では外部ログサービスに送信することも可能
  if (process.env.NODE_ENV === "production") {
    // 例: Sentry, LogRocket, etc.
  }
}
