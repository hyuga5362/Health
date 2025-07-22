export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DatabaseError"
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthenticationError"
  }
}

export function handleSupabaseError(error: any): never {
  console.error("Supabase operation failed:", error)
  if (error.code) {
    // Supabase specific error codes
    switch (error.code) {
      case "23505": // unique_violation
        throw new DatabaseError("入力されたデータは既に存在します。")
      case "22P02": // invalid_text_representation
        throw new DatabaseError("無効なデータ形式です。")
      case "PGRST000": // No rows found (e.g., for single() queries)
        throw new DatabaseError("データが見つかりませんでした。")
      default:
        throw new DatabaseError(`データベースエラーが発生しました: ${error.message}`)
    }
  } else if (error.message) {
    // General error messages
    if (error.message.includes("AuthApiError")) {
      throw new AuthenticationError("認証エラー: " + error.message.split(": ")[1])
    }
    throw new DatabaseError(`操作に失敗しました: ${error.message}`)
  }
  throw new DatabaseError("不明なデータベースエラーが発生しました。")
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof DatabaseError || error instanceof AuthenticationError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return "不明なエラーが発生しました。"
}

export function logError(error: unknown, context = "unknown") {
  console.error(`[ERROR] Context: ${context}`, error)
  if (error instanceof Error) {
    console.error(`Error Name: ${error.name}`)
    console.error(`Error Message: ${error.message}`)
    if (error.stack) {
      console.error(`Error Stack: ${error.stack}`)
    }
  }
}
