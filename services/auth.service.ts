import { supabase } from "@/lib/supabase"
import { handleSupabaseError, AuthError, validateEmail, validatePassword } from "@/lib/errors"
import type { User, Session } from "@supabase/supabase-js"

export interface AuthResponse {
  user: User | null
  session: Session | null
}

export interface SignUpData {
  email: string
  password: string
  options?: {
    data?: {
      full_name?: string
      avatar_url?: string
    }
  }
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  /**
   * メールアドレスとパスワードでサインアップ
   */
  static async signUp({ email, password, options }: SignUpData): Promise<AuthResponse> {
    try {
      // バリデーション
      if (!validateEmail(email)) {
        throw new AuthError("有効なメールアドレスを入力してください。")
      }

      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        throw new AuthError(passwordValidation.message!)
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          ...options,
        },
      })

      if (error) {
        handleSupabaseError(error)
      }

      return {
        user: data.user,
        session: data.session,
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * メールアドレスとパスワードでサインイン
   */
  static async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    try {
      if (!validateEmail(email)) {
        throw new AuthError("有効なメールアドレスを入力してください。")
      }

      if (!password) {
        throw new AuthError("パスワードを入力してください。")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        handleSupabaseError(error)
      }

      return {
        user: data.user,
        session: data.session,
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * Googleでサインイン
   */
  static async signInWithGoogle(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        handleSupabaseError(error)
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * サインアウト
   */
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        handleSupabaseError(error)
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * 現在のユーザーを取得
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        handleSupabaseError(error)
      }
      return user
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * 現在のセッションを取得
   */
  static async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error) {
        handleSupabaseError(error)
      }
      return session
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  /**
   * パスワードリセットメールを送信
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      if (!validateEmail(email)) {
        throw new AuthError("有効なメールアドレスを入力してください。")
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        handleSupabaseError(error)
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * パスワードを更新
   */
  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        throw new AuthError(passwordValidation.message!)
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        handleSupabaseError(error)
      }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      handleSupabaseError(error)
    }
  }

  /**
   * 認証状態の変更を監視
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
