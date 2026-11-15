import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AuthContext } from './AuthContext'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import {
  fetchIsAdmin,
  getSession,
  onAuthChange,
  signInWithPassword,
  signOut as signOutRequest,
} from '@/services/authService'

// Keeps the login session AND the "is this person an admin?" answer in one place.
//   session === undefined  -> still checking
//   session === null       -> nobody is logged in
export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState(isSupabaseConfigured ? undefined : null)
  const [attempt, setAttempt] = useState(0)
  const [adminCheck, setAdminCheck] = useState({ userId: null, attempt: -1, isAdmin: false, error: null })

  // 1) Load the saved session (Supabase keeps it in the browser) and listen for login / logout / token refresh.
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true
    getSession()
      .then((s) => {
        if (active) setSession(s)
      })
      .catch(() => {
        if (active) setSession(null)
      })
    const stopListening = onAuthChange((_event, s) => {
      if (active) setSession(s)
    })
    return () => {
      active = false
      stopListening()
    }
  }, [])

  const userId = session?.user?.id ?? null

  // 2) Whenever a user is logged in, check them against the admin_users table.
  useEffect(() => {
    if (!userId) return undefined
    let active = true
    fetchIsAdmin(userId)
      .then((ok) => {
        if (active) setAdminCheck({ userId, attempt, isAdmin: ok, error: null })
      })
      .catch((error) => {
        if (active) setAdminCheck({ userId, attempt, isAdmin: false, error })
      })
    return () => {
      active = false
    }
  }, [userId, attempt])

  const checked = userId !== null && adminCheck.userId === userId && adminCheck.attempt === attempt
  const loading = session === undefined || (userId !== null && !checked)
  const adminError = checked ? adminCheck.error : null
  const isAdmin = checked && adminCheck.isAdmin && !adminCheck.error

  const signIn = useCallback(async (email, password) => {
    const data = await signInWithPassword(email, password)
    setSession(data.session)
    return data
  }, [])

  const signOut = useCallback(async () => {
    try {
      await signOutRequest()
    } finally {
      setSession(null)
      queryClient.clear() // forget any admin data kept in memory
    }
  }, [queryClient])

  const recheck = useCallback(() => setAttempt((n) => n + 1), [])

  const value = useMemo(
    () => ({ loading, session, user: session?.user ?? null, isAdmin, adminError, signIn, signOut, recheck }),
    [loading, session, isAdmin, adminError, signIn, signOut, recheck],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
