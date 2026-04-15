import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [guestNickname, setGuestNickname] = useState(null)

  async function fetchProfile(userId) {
    const fetchPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timed out')), 5000)
    )

    try {
      const { data } = await Promise.race([fetchPromise, timeoutPromise])
      return data
    } catch {
      return null
    }
  }

  async function signUp({ email, password, nickname }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (!data.user) return { error: 'Sign up failed. Please try again.' }

    await new Promise(resolve => setTimeout(resolve, 500))

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: data.user.id, nickname }])

    if (profileError) return { error: profileError.message }

    return { error: null }
  }

  async function logIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  async function logOut() {
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch {
      // sign out errors are non-fatal; clear local state regardless
    }
    setUser(null)
    setProfile(null)
    setIsGuest(false)
    setGuestNickname(null)
  }

  function playAsGuest(nickname) {
    setIsGuest(true)
    setGuestNickname(nickname)
    setLoading(false)
  }

  useEffect(() => {
    let resolved = false

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        setLoading(false)
      }
    }, 3000)

    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          const p = await fetchProfile(session.user.id)
          setProfile(p)
        }
      } catch {
      } finally {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          setLoading(false)
        }
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          const p = await fetchProfile(session.user.id)
          setProfile(p)
          setIsGuest(false)
          setGuestNickname(null)
        } else {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const nickname = isGuest ? guestNickname : profile?.nickname ?? null

  return { user, profile, loading, isGuest, nickname, signUp, logIn, logOut, playAsGuest }
}