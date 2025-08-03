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

export class ApplicationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ApplicationError"
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
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
export function handleSupabaseError(error: unknown): never {
  console.error("Supabase error:", error)

  const errorObj = error as Record<string, unknown>

  if (errorObj?.code === "auth_session_missing") {
    throw new AuthError("認証セッションが見つかりません。再度ログインしてください。", errorObj.code as string)
  }

  if (errorObj?.code === "invalid_credentials") {
    throw new AuthError("メールアドレスまたはパスワードが正しくありません。", errorObj.code as string)
  }

  if (errorObj?.code === "email_not_confirmed") {
    throw new AuthError("メールアドレスの確認が完了していません。", errorObj.code as string)
  }

  if (errorObj?.code === "signup_disabled") {
    throw new AuthError("新規登録は現在無効になっています。", errorObj.code as string)
  }

  if (errorObj?.code === "email_address_invalid") {
    throw new AuthError("有効なメールアドレスを入力してください。", errorObj.code as string)
  }

  if (errorObj?.code === "password_too_short") {
    throw new AuthError("パスワードは6文字以上で入力してください。", errorObj.code as string)
  }

  if (errorObj?.code === "PGRST116") {
    throw new DatabaseError("データが見つかりませんでした。")
  }

  if (errorObj?.code === "23505") {
    throw new DatabaseError("データが既に存在します。")
  }

  if (errorObj?.code === "42501") {
    throw new DatabaseError("データベースへのアクセス権限がありません。")
  }

  if (errorObj?.message) {
    throw new DatabaseError(`データベースエラー: ${errorObj.message}`)
  }

  throw new DatabaseError("予期しないエラーが発生しました。")
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
