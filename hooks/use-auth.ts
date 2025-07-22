"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/services/auth.service"
import type { User } from "@supabase/supabase-js"
import { getErrorMessage, logError } from "@/lib/errors"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      logError(err, "useAuth.fetchUser")
      setError(getErrorMessage(err))
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()

    const { data: authListener } = AuthService.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, "Session:", session)
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [fetchUser])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { user: signedInUser } = await AuthService.signIn(email, password)
      setUser(signedInUser)
      return signedInUser
    } catch (err) {
      logError(err, "useAuth.signIn")
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { user: signedUpUser } = await AuthService.signUp(email, password)
      setUser(signedUpUser)
      return signedUpUser
    } catch (err) {
      logError(err, "useAuth.signUp")
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    try {
      await AuthService.signOut()
      setUser(null)
      router.push("/login")
    } catch (err) {
      logError(err, "useAuth.signOut")
      setError(getErrorMessage(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refetchUser: fetchUser,
  }
}
