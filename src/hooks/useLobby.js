import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useLobby() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function createLobby({ name, password }) {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('lobbies')
      .insert([{ name, password }])
      .select()
      .single()
    setLoading(false)
    if (error) { setError(error.message); return null }
    return data
  }

  async function fetchLobbies() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('lobbies')
      .select('*')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) { setError(error.message); return [] }
    return data
  }

  async function joinLobby({ lobbyId, password }) {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('lobbies')
      .select('*')
      .eq('id', lobbyId)
      .single()
    setLoading(false)
    if (error) { setError(error.message); return null }
    if (data.password !== password) {
      setError('Incorrect password')
      return null
    }
    return data
  }

  return { createLobby, joinLobby, fetchLobbies, loading, error }
}