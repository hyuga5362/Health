"use client"

import { useState, useEffect } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { AuthService } from "@/services/auth.service"
import { UserSettingsService } from "@/services/user-settings.service"

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // 初期セッションを取得
    const getInitialSession = async () => {
      try {
        const session = await AuthService.getCurrentSession()
        const user = session?.user || null

        setState({
          user,
          session,
          loading: false,
          isAuthenticated: !!user,
        })

        // ユーザーが認証されている場合、設定を初期化
        if (user) {
          try {
            await UserSettingsService.get()
          } catch (error) {
            console.error("Failed to initialize user settings:", error)
          }
        }
      } catch (error) {
        console.error("Failed to get initial session:", error)
        setState((prev) => ({ ...prev, loading: false }))
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange(async (event, session) => {
      const user = session?.user || null

      setState({
        user,
        session,
        loading: false,
        isAuthenticated: !!user,
      })

      // ユーザーがサインインした場合、設定を初期化
      if (event === "SIGNED_IN" && user) {
        try {
          await UserSettingsService.get()
        } catch (error) {
          console.error("Failed to initialize user settings:", error)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const result = await AuthService.signUp({ email, password })
      return result
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }))
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const result = await AuthService.signIn({ email, password })
      return result
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }))
      throw error
    }
  }

  const signInWithGoogle = async () => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      await AuthService.signInWithGoogle()
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }))
      throw error
    }
  }

  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      await AuthService.signOut()
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }))
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await AuthService.resetPassword(email)
    } catch (error) {
      throw error
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      await AuthService.updatePassword(newPassword)
    } catch (error) {
      throw error
    }
  }

  return {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
  }
}
