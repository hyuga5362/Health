import { supabase } from "@/lib/supabase"
import { AuthenticationError, handleSupabaseError } from "@/lib/errors"
import type { User } from "@supabase/supabase-js"

export class AuthService {
  static async signIn(email: string, password: string): Promise<{ user: User }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        handleSupabaseError(error)
      }
      if (!data.user) {
        throw new AuthenticationError("ログインに失敗しました。")
      }
      return { user: data.user }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  static async signUp(email: string, password: string): Promise<{ user: User }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        handleSupabaseError(error)
      }
      if (!data.user) {
        throw new AuthenticationError("サインアップに失敗しました。")
      }
      return { user: data.user }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

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

  static onAuthStateChange(callback: (event: string, session: any | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
