import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useLobby() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function createLobby({ name, password }) {
  setLoading(true)
  setError(null)

  // race between the insert and a 5 second timeout
  const insertPromise = supabase
    .from('lobbies')
    .insert([{ name, password }])
    .select()
    .single()

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out. Please try again.')), 5000)
  )

  try {
    const { data, error } = await Promise.race([insertPromise, timeoutPromise])
    setLoading(false)
    if (error) { setError(error.message); return null }
    return data
  } catch (err) {
    setLoading(false)
    setError(err.message)
    return null
  }
}

  async function fetchLobbies() {
  setLoading(true)
  setError(null)

  const fetchPromise = supabase
    .from('lobbies')
    .select('*')
    .order('created_at', { ascending: false })

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), 5000)
  )

  try {
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise])
    setLoading(false)
    if (error) { setError(error.message); return [] }
    return data
  } catch (err) {
    setLoading(false)
    setError(err.message)
    return []
  }
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

  async function addPlayer({ lobbyId, nickname }) {
    const { data, error } = await supabase
      .from('players')
      .insert([{ lobby_id: lobbyId, nickname }])
      .select()
      .single()
    if (error) { console.error(error.message); return null }
    return data
  }

  async function removePlayer(playerId) {
    await supabase.from('players').delete().eq('id', playerId)
  }

  function subscribePlayers(lobbyId, onChange) {
    const channel = supabase
      .channel(`players:${lobbyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `lobby_id=eq.${lobbyId}`,
      }, onChange)
      .subscribe()
    return channel
  }

  async function fetchPlayers(lobbyId) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('lobby_id', lobbyId)
      .order('created_at', { ascending: true })
    if (error) { console.error(error.message); return [] }
    return data
  }

  return {
    createLobby, joinLobby, fetchLobbies,
    addPlayer, removePlayer, subscribePlayers, fetchPlayers,
    loading, error
  }
}