"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getErrorMessage, logError } from "@/lib/errors"
import type { User, Session } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  // 認証状態の初期化
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        // 初期セッションを取得
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (mounted) {
          setState({
            user: session?.user || null,
            session,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        logError(error, "useAuth.initAuth")
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
            error: getErrorMessage(error),
          })
        }
      }
    }

    initAuth()

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setState((prev) => ({
          ...prev,
          user: session?.user || null,
          session,
          loading: false,
          error: null,
        }))
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // サインアップ
  const signUp = async (email: string, password: string, options?: { data?: { full_name?: string } }) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          ...options,
        },
      })

      if (error) {
        throw error
      }

      setState((prev) => ({
        ...prev,
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      }))

      return { user: data.user, session: data.session }
    } catch (error) {
      logError(error, "useAuth.signUp")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // サインイン
  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setState((prev) => ({
        ...prev,
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      }))

      return { user: data.user, session: data.session }
    } catch (error) {
      logError(error, "useAuth.signIn")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // Googleサインイン
  const signInWithGoogle = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
      // OAuth の場合、リダイレクトされるので状態更新は不要
    } catch (error) {
      logError(error, "useAuth.signInWithGoogle")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // サインアウト
  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
      })
    } catch (error) {
      logError(error, "useAuth.signOut")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // パスワードリセット
  const resetPassword = async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      setState((prev) => ({ ...prev, loading: false, error: null }))
    } catch (error) {
      logError(error, "useAuth.resetPassword")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // パスワード更新
  const updatePassword = async (newPassword: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw error
      }

      setState((prev) => ({ ...prev, loading: false, error: null }))
    } catch (error) {
      logError(error, "useAuth.updatePassword")
      const errorMessage = getErrorMessage(error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  // エラーをクリア
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }))
  }

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
  }
}
