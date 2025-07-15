export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string,
    public hint?: string,
  ) {
    super(message)
    this.name = "SupabaseError"
  }
}

export class AuthError extends SupabaseError {
  constructor(message: string, code?: string) {
    super(message, code)
    this.name = "AuthError"
  }
}

export class DatabaseError extends SupabaseError {
  constructor(message: string, code?: string, details?: string) {
    super(message, code, details)
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

export function handleSupabaseError(error: any): never {
  if (error?.code) {
    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-email":
        throw new AuthError("認証に失敗しました。メールアドレスとパスワードを確認してください。", error.code)
      case "auth/email-already-in-use":
        throw new AuthError("このメールアドレスは既に使用されています。", error.code)
      case "auth/weak-password":
        throw new AuthError("パスワードが弱すぎます。より強力なパスワードを設定してください。", error.code)
      case "PGRST116":
        throw new DatabaseError("データが見つかりません。", error.code)
      case "23505":
        throw new DatabaseError("データが重複しています。", error.code, error.details)
      case "23503":
        throw new DatabaseError("関連するデータが存在しません。", error.code, error.details)
      default:
        throw new SupabaseError(error.message || "エラーが発生しました。", error.code, error.details, error.hint)
    }
  }

  throw new Error(error.message || "予期しないエラーが発生しました。")
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: "パスワードは6文字以上である必要があります。" }
  }
  return { isValid: true }
}

type HealthStatus = "good" | "normal" | "bad"
type Theme = "light" | "dark" | "system"

export function validateHealthStatus(status: string): status is HealthStatus {
  return ["good", "normal", "bad"].includes(status)
}

export function validateTheme(theme: string): theme is Theme {
  return ["light", "dark", "system"].includes(theme)
}
